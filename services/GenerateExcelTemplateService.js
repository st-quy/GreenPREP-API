const {
  generateExcelTemplate,
} = require("../utils/excel/GenerateExcelTemplate");
const ExcelJS = require("exceljs");
const { Topic, Part, Question, Skill } = require("../models");

const normalizeString = (str) =>
  str?.toString().trim().toLowerCase().replace(/\s+/g, "") || "";

const generateTemplateFile = async () => {
  return await generateExcelTemplate();
};

function formatQuestionContent(questionContent) {
  const lines = (questionContent || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const leftItems = [];
  const rightItems = [];

  let firstOptions = null;
  let allOptionsSame = true;

  lines.forEach((line) => {
    const [left, right] = line.split("|").map((part) => part.trim());

    if (left) {
      leftItems.push(left);
    }

    if (right) {
      const options = right
        .split("/")
        .map((option) => option.split(".")[1]?.trim());
      if (firstOptions === null) {
        firstOptions = options;
      } else if (JSON.stringify(firstOptions) !== JSON.stringify(options)) {
        allOptionsSame = false;
      }
    }
  });

  if (allOptionsSame && firstOptions) {
    rightItems.push(firstOptions);
  }

  return { leftItems, rightItems };
}

const formatQuestionToJson = (
  question,
  questionContent,
  correctAnswer,
  partID
) => {
  return {
    title: question,
    audioKey: "",
    listContent: questionContent
      .split("Options")
      .slice(1)
      .map((content, index) => {
        const lines = content.split("\n").filter((line) => line.trim() !== "");
        const questionText = lines[1].replace(/^\d+: /, "").trim();
        const options = lines
          .slice(2)
          .map((opt) => opt.replace(/^[A-C]\)/, "").trim());

        const correctOption = correctAnswer.match(
          new RegExp(`Options ${index + 1}: (\\d+) \\| ([A-C])`)
        );
        const correctAnswerText = correctOption
          ? options[parseInt(correctOption[1]) - 1]
          : "";

        return {
          ID: index + 1,
          content: questionText,
          options: options,
          correctAnswer: correctAnswerText,
          type: "multiple-choice",
          partID: partID,
        };
      }),
  };
};

const formatAnswers = (answersStr) => {
  return answersStr.split("\n").map((line) => {
    const parts = line.split(".");
    return parts.slice(1).join(".").trim();
  });
};

const formatCorrectAnswer = (correctAnswerStr, questionContentStr) => {
  const correctAnswers = correctAnswerStr.split("\n").map((line) => {
    const [key, value] = line.split("|").map((s) => s.trim());
    return { key, value: parseInt(value, 10) };
  });

  const options = questionContentStr.split("\n").map((line) => {
    const [key, ...rest] = line.split(".");
    const answer = rest.join(".").trim();
    return { key: key.trim(), answer };
  });

  return correctAnswers.map((answer) => {
    const matchingOption = options.find((option) => option.key === answer.key);
    return { key: matchingOption.answer, value: answer.value };
  });
};

const parseAnswers = (correctStr, contentStr) =>
  correctStr
    .trim()
    .split("\n")
    .map((line, i) => {
      const [keyPart, ansLetter] = line.split("|").map((s) => s.trim());
      const key = keyPart.trim();
      const answer = ansLetter?.toUpperCase();
      const optionsLine =
        contentStr.split("\n")[i]?.split("|")[1]?.trim() || "";
      const options = Object.fromEntries(
        optionsLine.split("/").map((opt) => {
          const [k, ...v] = opt.split(".");
          return [k.trim(), v.join(".").trim()];
        })
      );
      return { key, value: options[answer] || "" };
    });

const parseQuestionContent = (contentStr) =>
  contentStr
    .trim()
    .split("\n")
    .map((line) => {
      const [keyPart, opts] = line.split("|").map((s) => s.trim());
      const key = keyPart.match(/\d+/)?.[0];
      const value = opts
        .split("/")
        .map((opt) => opt.split(".").slice(1).join(".").trim());
      return { key, value };
    });

const parseExcelBuffer = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  const partsData = [];
  const topicSet = new Set();

  sheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return;
    const topic = row.getCell("A").value;
    const skill = row.getCell("B").value;
    const part = row.getCell("C").value;
    const subPart = row.getCell("D").value;

    if (part && skill) {
      partsData.push({
        topic: topic?.toString().trim(),
        skill: skill?.toString().trim(),
        part: isNaN(part) ? part.toString().trim() : `Part${part}`,
        subPart,
      });
      topicSet.add(topic?.toString().trim());
    }
  });

  if (topicSet.size === 0) {
    return { status: 400, message: "No topic found in file" };
  }

  const topicName = [...topicSet][0];
  const existingTopic = await Topic.findOne({ where: { Name: topicName } });

  if (existingTopic) {
    return { status: 400, message: "Topic already exists" };
  }

  const createdTopic = await Topic.create({ Name: topicName });
  const topicId = createdTopic.ID;

  const createdParts = await Promise.all(
    partsData.map(async ({ part, subPart }) => {
      const match = part.match(/\d+/);
      const sequence = match ? parseInt(match[0], 10) : null;
      const newPart = await Part.create({
        Content: part,
        SubContent: subPart,
        Sequence: sequence,
        TopicID: topicId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: newPart.ID, content: newPart.Content };
    })
  );

  const skills = await Skill.findAll({ attributes: ["ID", "Name"] });

  const skillMap = skills.reduce((map, skill) => {
    map[normalizeString(skill.Name)] = skill.ID;
    return map;
  }, {});

  const partMap = createdParts.reduce((map, part) => {
    map[normalizeString(part.content)] = part.id;
    return map;
  }, {});
  try {
    for (const row of sheet.getRows(2, sheet.rowCount - 1) || []) {
      const questionType = row
        .getCell("E")
        .value?.toString()
        .toLowerCase()
        .trim();

      const cells = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
      ].map((col) => row.getCell(col).value);
      if (cells.every((v) => v === null || v === "")) break;

      const [
        topic,
        skillName,
        partContent,
        subPart,
        type,
        sequence,
        audioLink,
        imageLink,
        question,
        questionContent,
        correctAnswer,
        subQuestion,
        groupQuestion,
      ] = cells;

      console.log("====================================");
      console.log(imageLink);
      console.log("====================================");
      const partID =
        createdParts.find(
          (s) =>
            s.content.toLowerCase().replace(/\s+/g, "") ===
            (partContent || "").toLowerCase().replace(/\s+/g, "")
        )?.id || null;

      const skillID =
        skills.find(
          (s) =>
            s.Name.toLowerCase().replace(/\s+/g, "") ===
            skillName.toLowerCase().replace(/\s+/g, "")
        )?.ID || null;

      if (type == "dropdown-list") {
        const lines = (questionContent || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        const optionsAfterPipe = lines.map(
          (line) => line.split("|")[1]?.trim().toLowerCase() || ""
        );
        const allSame = optionsAfterPipe.every(
          (opt) => opt === optionsAfterPipe[0]
        );

        if (!allSame) {
          await Question.create({
            Type: type,
            AudioKeys: audioLink ? audioLink.text : null,
            ImageKeys: imageLink ? [imageLink] : null,
            SkillID: skillID,
            PartID: partID,
            Sequence: sequence,
            Content: question,
            SubContent: subQuestion,
            GroupContent: groupQuestion,
            AnswerContent: {
              content: question,
              options: parseQuestionContent(questionContent),
              correctAnswer: parseAnswers(correctAnswer, questionContent),
              partID: partID,
              type: questionType,
              type: type,
              ...(audioLink &&
              typeof audioLink === "string" &&
              audioLink.trim() !== ""
                ? { audioKeys: audioLink }
                : {}),
            },
          });
        } else {
          const { leftItems, rightItems } =
            formatQuestionContent(questionContent);
          await Question.create({
            Type: type,
            AudioKeys: audioLink ? audioLink.text : null,
            ImageKeys: imageLink ? [imageLink] : null,
            SkillID: skillID,
            PartID: partID,
            Sequence: sequence,
            Content: question,
            SubContent: subQuestion,
            GroupContent: groupQuestion,
            AnswerContent: {
              content: question,
              leftItems: leftItems,
              rightItems: rightItems,
              correctAnswer: parseAnswers(correctAnswer, questionContent),
              partID: partID,
              type: type,
              ...(audioLink &&
              typeof audioLink === "string" &&
              audioLink.trim() !== ""
                ? { audioKeys: audioLink.text }
                : {}),
            },
          });
        }
      }
      if (type == "listening-questions-group") {
        await Question.create({
          Type: type,
          AudioKeys: audioLink ? audioLink.text : null,
          ImageKeys: imageLink ? [imageLink] : null,
          SkillID: skillID,
          PartID: partID,
          Sequence: sequence,
          Content: question,
          SubContent: subQuestion,
          GroupContent: formatQuestionToJson(
            question,
            questionContent,
            correctAnswer,
            partID
          ),
          AnswerContent: {
            content: question,
            groupContent: formatQuestionToJson(
              question,
              questionContent,
              correctAnswer,
              partID
            ),
            partID: partID,
            type: type,
            ...(audioLink &&
            typeof audioLink === "string" &&
            audioLink.trim() !== ""
              ? { audioKeys: audioLink }
              : {}),
          },
        });
      }
      if (type == "ordering") {
        await Question.create({
          Type: type,
          AudioKeys: audioLink ? audioLink.text : null,
          ImageKeys: imageLink ? [imageLink] : null,
          SkillID: skillID,
          PartID: partID,
          Sequence: sequence,
          Content: question,
          SubContent: subQuestion,
          GroupContent: groupQuestion,
          AnswerContent: {
            content: question,
            options: formatAnswers(questionContent),
            correctAnswer: formatCorrectAnswer(correctAnswer, questionContent),
            partID: partID,
            type: type,
          },
        });
      }
      if (type == "speaking") {
        await Question.create({
          Type: type,
          AudioKeys: audioLink ? audioLink.text : null,
          ImageKeys: imageLink ? [imageLink] : null,
          SkillID: skillID,
          PartID: partID,
          Sequence: sequence,
          Content: question,
          SubContent: subQuestion,
          GroupContent: groupQuestion,
          AnswerContent: {
            content: question,
            groupContent: groupQuestion,
            options: questionContent,
            correctAnswer: correctAnswer,
            partID: partID,
            type: type,
            ImageKeys: `[${imageLink}]`,
          },
        });
      }
      if (type == "writing") {
        await Question.create({
          Type: type,
          AudioKeys: audioLink ? audioLink : null,
          ImageKeys: imageLink ? [imageLink] : null,
          SkillID: skillID,
          PartID: partID,
          Sequence: sequence,
          Content: question,
          SubContent: subQuestion,
          GroupContent: groupQuestion,
          AnswerContent: correctAnswer,
        });
      }
    }
  } catch (error) {
    console.error("Error processing sheet rows:", error);
  }

  return { status: 200, message: "Parse Successfully" };
};

module.exports = { generateTemplateFile, parseExcelBuffer };
