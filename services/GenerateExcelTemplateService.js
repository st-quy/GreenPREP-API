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

const parseAnswers = (correctStr, contentStr) =>
  correctStr
    .trim()
    .split("\n")
    .map((line, i) => {
      const [keyPart, ansLetter] = line.split("|").map((s) => s.trim());
      const key = keyPart.match(/\d+/)?.[0];
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
          AudioKeys: audioLink,
          ImageKeys: imageLink,
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
            ...(audioLink && audioLink.trim() !== ""
              ? { audioKeys: audioLink }
              : {}),
          },
        });
      } else {
        const { leftItems, rightItems } =
          formatQuestionContent(questionContent);
        await Question.create({
          Type: type,
          AudioKeys: audioLink,
          ImageKeys: imageLink,
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
            ...(audioLink && audioLink.trim() !== ""
              ? { audioKeys: audioLink }
              : {}),
          },
        });
      }
    }
  }

  return { status: 200, message: "Parse Successfully" };
};

module.exports = { generateTemplateFile, parseExcelBuffer };
