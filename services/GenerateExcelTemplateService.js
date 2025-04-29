const {
  generateExcelTemplate,
} = require("../utils/excel/GenerateExcelTemplate");
const ExcelJS = require("exceljs");
const { Topic, Part, Question, Skill } = require("../models");
const { sequelize } = require("../models");

const {
  formatAnswers,
  formatCorrectAnswer,
} = require("../utils/formatters/GenericFormatter");

const {
  formatQuestionContent,
  formatQuestionToJson,
  formatTitleWithAudio,
} = require("../utils/formatters/GroupQuestionFormatter");

const {
  formatMatchingContent,
} = require("../utils/formatters/MatchingFormatter");

const {
  formatMultipleChoice,
} = require("../utils/formatters/MultipleChoiceFormatter");

const { parseAnswers } = require("../utils/parsers/AnswerParser");

const {
  parseMatchingAnswers,
} = require("../utils/parsers/MatchingAnswerParser");

const {
  parseQuestionContent,
} = require("../utils/parsers/QuestionContentParser");

const generateTemplateFile = async () => {
  try {
    const file = await generateExcelTemplate();
    return file;
  } catch (error) {
    throw new Error("Error generating Excel template: " + error.message);
  }
};

const parseExcelBuffer = async (buffer) => {
  const transaction = await sequelize.transaction();
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
    const existingTopic = await Topic.findOne({
      where: { Name: topicName },
    });
    if (existingTopic) {
      return { status: 400, message: "Topic already exists" };
    }

    const createdTopic = await Topic.create(
      { Name: topicName },
      { transaction }
    );
    const topicId = createdTopic.ID;

    const createdParts = await Promise.all(
      partsData.map(async ({ part, subPart }) => {
        const match = part.match(/\d+/);
        const sequence = match ? parseInt(match[0], 10) : null;
        const newPart = await Part.create(
          {
            Content: part,
            SubContent: subPart,
            Sequence: sequence,
            TopicID: topicId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            transaction,
          }
        );
        return { id: newPart.ID, content: newPart.Content };
      })
    );

    const skills = await Skill.findAll({
      attributes: ["ID", "Name"],
    });

    const questionsToCreate = [];

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
            if (audioLink) {
              groupQuestion = formatTitleWithAudio(question, audioLink);
            }
            answerContent = {
              content: question,
              ...(groupQuestion ? { groupContent: groupQuestion } : {}),
              leftItems,
              rightItems,
              correctAnswer: parseAnswers(correctAnswer, questionContent),
              partID,
              type,
              ...(audioLink ? { audioKeys: audioLink } : {}),
            };
          } else {
            if (audioLink) {
              groupQuestion = formatTitleWithAudio(question, audioLink);
            }
            answerContent = {
              content: question,
              ...(groupQuestion ? { groupContent: groupQuestion } : {}),
              options: parseQuestionContent(questionContent),
              correctAnswer: parseAnswers(correctAnswer, questionContent),
              partID,
              type,
              ...(audioLink ? { audioKeys: audioLink } : {}),
            };
          }
          break;
        }

        case "matching": {
          const { leftItems, rightItems } =
            formatMatchingContent(questionContent);
          if (audioLink) {
            groupQuestion = formatTitleWithAudio(question, audioLink);
          }
          answerContent = {
            ...(groupQuestion ? { groupContent: groupQuestion } : {}),
            leftItems,
            rightItems,
            correctAnswer: parseMatchingAnswers(correctAnswer, rightItems),
            ...(audioLink ? { audioKeys: audioLink } : {}),
          };
          break;
        }

        case "listening-questions-group": {
          const groupContent = formatQuestionToJson(
            question,
            questionContent,
            correctAnswer,
            partID,
            type
          );
          groupQuestion = groupContent;
          answerContent = {
            content: question,
            ...(groupQuestion ? { groupContent: groupQuestion } : {}),
            groupContent,
            partID,
            type,
            ...(audioLink ? { audioKeys: audioLink } : {}),
          };
          break;
        }

        case "multiple-choice": {
          if (audioLink) {
            groupQuestion = formatTitleWithAudio(question);
          }
          const { options, correctAnswer: correctValue } = formatMultipleChoice(
            questionContent,
            correctAnswer
          );
          if (!correctValue) {
            console.error("Correct answer not found for multiple-choice:", {
              correctAnswer,
              options,
            });
            throw new Error("Correct answer not found in options");
          }
          answerContent = {
            content: question,
            ...(groupQuestion ? { groupContent: groupQuestion } : {}),
            options,
            correctAnswer: correctValue,
            ...(audioLink ? { audioKeys: audioLink.text } : {}),
          };
          break;
        }

        case "ordering": {
          if (audioLink) {
            groupQuestion = formatTitleWithAudio(question, audioLink);
          }
          answerContent = {
            content: question,
            ...(groupQuestion ? { groupContent: groupQuestion } : {}),
            options: formatAnswers(questionContent),
            correctAnswer: formatCorrectAnswer(correctAnswer, questionContent),
            partID,
            type,
            ...(audioLink ? { audioKeys: audioLink } : {}),
          };
          break;
        }

        case "speaking": {
          if (audioLink) {
            groupQuestion = formatTitleWithAudio(question, audioLink);
          }
          answerContent = {
            content: question,
            ...(groupQuestion ? { groupContent: groupQuestion } : {}),
            groupContent: groupQuestion,
            options: questionContent,
            correctAnswer,
            partID,
            type,
            ImageKeys: `[${imageLink}]`,
            ...(audioLink ? { audioKeys: audioLink } : {}),
          };
          break;
        }

        case "writing": {
          if (audioLink) {
            groupQuestion = formatTitleWithAudio(question, audioLink);
          }
          answerContent = correctAnswer;
          break;
        }

        default:
          console.warn(`Unknown type: ${type}`);
          continue;
      }

      questionsToCreate.push({
        Type: type,
        AudioKeys:
          audioLink?.text || (typeof audioLink === "string" ? audioLink : null),
        ImageKeys: imageLink ? [imageLink] : null,
        SkillID: skillID,
        PartID: partID,
        Sequence: sequence,
        Content: question,
        SubContent: subQuestion,
        GroupContent: groupQuestion,
        AnswerContent: answerContent,
      });
    }

    try {
      await Question.bulkCreate(questionsToCreate, { transaction });
    } catch (error) {
      await transaction.rollback();
      return {
        status: 500,
        message: `Bulk insert failed: ${error.message}`,
      };
    }
    await transaction.commit();
    return { status: 200, message: "Parse Successfully" };
  } catch (error) {
    await transaction.rollback();
    return { status: 500, message: `Error parsing file: ${error.message}` };
  }
};

module.exports = { generateTemplateFile, parseExcelBuffer };
