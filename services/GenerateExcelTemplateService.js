const {
  generateExcelTemplate,
} = require("../utils/excel/GenerateExcelTemplate");
const ExcelJS = require("exceljs");
const { Topic, Part, Question, Skill } = require("../models");

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

    if (left) leftItems.push(left);

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

function formatMatchingContent(questionContent) {
  const lines = (questionContent || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const leftItems = [];
  const rightItems = [];
  let parsingContents = false;
  let parsingOptions = false;

  lines.forEach((line) => {
    if (line.toLowerCase().startsWith("contents:")) {
      parsingContents = true;
      parsingOptions = false;
      return;
    }
    if (line.toLowerCase().startsWith("options:")) {
      parsingOptions = true;
      parsingContents = false;
      return;
    }

    if (parsingContents) {
      const content = line.replace(/^\d+\.\s*/, "").trim();
      if (content) leftItems.push(content);
    } else if (parsingOptions) {
      const optionMatch = line.match(/^[A-Z]\.\s*(.*)$/i);
      if (optionMatch) rightItems.push(optionMatch[1].trim());
    }
  });

  return { leftItems, rightItems };
}

function formatMultipleChoice(questionContent, correctAnswer) {
  const lines = (questionContent || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const options = lines
    .map((line) => {
      const match = line.match(/^([A-Z])[.)]\s*(.+)$/i);
      if (!match) return null;
      return { key: match[1].toUpperCase(), value: match[2].trim() };
    })
    .filter(Boolean);

  const correct = correctAnswer.trim().toUpperCase();
  const correctOption = options.find((opt) => opt.key === correct);

  return {
    options,
    correctAnswer: correctOption ? correctOption.value : null,
  };
}

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

function parseMatchingAnswers(correctStr, rightItems) {
  return correctStr
    .trim()
    .split("\n")
    .map((line) => {
      const [leftNum, optionLetter] = line.split("|").map((s) => s.trim());
      if (!leftNum || !optionLetter) return null;

      const index = optionLetter.charCodeAt(0) - "A".charCodeAt(0);
      const right = rightItems[index] || "";

      return {
        left: leftNum,
        right,
      };
    })
    .filter(Boolean);
}

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
  try {
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

      let [
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

      skillName =
        skillName === "Grammar & Vocabulary"
          ? "GRAMMAR AND VOCABULARY"
          : skillName;

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

      let answerContent = {};

      try {
        switch (type) {
          case "dropdown-list": {
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

            if (allSame) {
              const { leftItems, rightItems } =
                formatQuestionContent(questionContent);
              answerContent = {
                content: question,
                leftItems,
                rightItems,
                correctAnswer: parseAnswers(correctAnswer, questionContent),
                partID,
                type,
              };
            } else {
              answerContent = {
                content: question,
                options: parseQuestionContent(questionContent),
                correctAnswer: parseAnswers(correctAnswer, questionContent),
                partID,
                type,
              };
            }
            break;
          }

          case "matching": {
            const { leftItems, rightItems } =
              formatMatchingContent(questionContent);
            answerContent = {
              leftItems,
              rightItems,
              correctAnswer: parseMatchingAnswers(correctAnswer, rightItems),
            };
            break;
          }

          case "listening-questions-group": {
            const groupContent = formatQuestionToJson(
              question,
              questionContent,
              correctAnswer,
              partID
            );
            answerContent = {
              content: question,
              groupContent,
              partID,
              type,
            };
            break;
          }

          case "multiple-choice": {
            const { options, correctAnswer: correctValue } =
              formatMultipleChoice(questionContent, correctAnswer);
            if (!correctValue) {
              console.error("Correct answer not found for multiple-choice:", {
                correctAnswer,
                options,
              });
              throw new Error("Correct answer not found in options");
            }
            answerContent = {
              title: question,
              options,
              correctAnswer: correctValue,
            };
            break;
          }

          case "ordering": {
            answerContent = {
              content: question,
              options: formatAnswers(questionContent),
              correctAnswer: formatCorrectAnswer(
                correctAnswer,
                questionContent
              ),
              partID,
              type,
            };
            break;
          }

          case "speaking": {
            answerContent = {
              content: question,
              groupContent: groupQuestion,
              options: questionContent,
              correctAnswer,
              partID,
              type,
              ImageKeys: `[${imageLink}]`,
            };
            break;
          }

          case "writing": {
            answerContent = correctAnswer;
            break;
          }

          default:
            console.warn(`Unknown type: ${type}`);
            continue;
        }

        await Question.create({
          Type: type,
          AudioKeys:
            audioLink?.text ||
            (typeof audioLink === "string" ? audioLink : null),
          ImageKeys: imageLink ? [imageLink] : null,
          SkillID: skillID,
          PartID: partID,
          Sequence: sequence,
          Content: question,
          SubContent: subQuestion,
          GroupContent: groupQuestion,
          AnswerContent: answerContent,
        });
      } catch (error) {
        console.error(`Failed to create question (type: ${type}):`, error);
        throw error;
      }
    }

    return { status: 200, message: "Parse Successfully" };
  } catch (error) {
    console.error("Error parsing Excel Buffer:", error);
    return { status: 500, message: `Error parsing file: ${error.message}` };
  }
};

module.exports = { generateTemplateFile, parseExcelBuffer };
