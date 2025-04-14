const {
  User,
  Session,
  Class,
  SessionParticipant,
  Question,
  StudentAnswer,
  Part,
} = require("../models");
const SendEmailService = require("../services/SendEmailService");
const path = require("path");
const { generatePDF } = require("../reports/generate-pdf");
const { where } = require("sequelize");
const { log } = require("console");

const sendEmailSubmit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionName, testDetails, nextSteps, contactInfo } = req.body;

    const result = await SendEmailService.sendEmail(
      userId,
      sessionName,
      testDetails,
      nextSteps,
      contactInfo
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const { studentId, sessionId, classId } = req.params;
    const studentInformation = await User.findOne({
      where: { ID: "7e8fd692-857c-46fa-90b6-fcc6764dd5ab" },
      attributes: ["ID", "lastName"],
    });
    const classname = await Class.findOne({
      where: { ID: "20ff020a-87ae-43d7-82d2-1699c38815df" },
      attributes: ["ID", "className"],
    });
    const sessionInformation = await Session.findOne({
      where: {
        ClassID: "20ff020a-87ae-43d7-82d2-1699c38815df",
        examSet: "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc",
      },
      attributes: [
        "ID",
        "sessionName",
        "sessionKey",
        "startTime",
        "endTime",
        "status",
      ],
    });
    const sessionParticipant = await SessionParticipant.findOne({
      where: {
        UserID: "c2756352-6db3-4ed3-9a6d-eed04a6bd757",
        SessionID: "0327add0-966e-4540-9006-cea0d6bd7230",
      },
      attributes: [
        "ID",
        "UserID",
        "SessionID",
        "GrammarVocab",
        "GrammarVocabLevel",
        "Reading",
        "ReadingLevel",
        "Listening",
        "ListeningLevel",
        "Writing",
        "WritingLevel",
        "Speaking",
        "SpeakingLevel",
        "Total",
        "Level",
        "createdAt",
      ],
    });
    const studentID = "77b5f9cb-73ba-4edd-9c90-998710832c87";
    const topicID = "ef6b69aa-2ec2-4c65-bf48-294fd12e13fc";

    // B1: Lấy tất cả câu hỏi theo topicID (giả sử bảng Question có topicID)
    const studentAnswers = await StudentAnswer.findAll({
      where: { TopicID: topicID, StudentID: studentID },
      attributes: ["QuestionID", "AnswerText", "AnswerAudio", "Comment"],
      raw: true,
    });

    const questionIDs = studentAnswers.map((sa) => sa.QuestionID);

    const questions = await Question.findAll({
      where: {
        ID: questionIDs,
        Type: ["writing", "speaking"],
      },
      attributes: ["ID", "Content", "Type", "PartID"],
      raw: true,
    });

    const answerMap = {};
    studentAnswers.forEach((ans) => {
      answerMap[ans.QuestionID] = ans; // Tạo answerMap với QuestionID làm key
    });

    const partIDs = [...new Set(questions.map((q) => q.PartID))];

    const parts = await Part.findAll({
      where: {
        ID: partIDs,
      },
      attributes: ["ID", "Content"],
      raw: true,
    });

    const partMap = {};
    parts.forEach((part) => {
      partMap[part.ID] = part.Content;
    });

    const result = {};

    questions.forEach((question) => {
      const answer = answerMap[question.ID] || {};

      const questionWithAnswer = {
        ...question,
        AnswerText: question.Type === "writing" ? answer.AnswerText ?? "" : "",
        AnswerAudio:
          question.Type === "speaking" ? answer.AnswerAudio ?? "" : "",
        Comment: answer.Comment ?? "",
      };

      if (!result[question.Type]) result[question.Type] = {};

      if (!result[question.Type][question.PartID]) {
        result[question.Type][question.PartID] = {
          PartID: question.PartID,
          ContentPart: partMap[question.PartID],
          questions: [],
        };
      }

      result[question.Type][question.PartID].questions.push(questionWithAnswer);
    });

    console.log(result);

    console.log(
      "Tất cả các câu hỏi:",
      questions.map((q) => ({
        ...q,
      }))
    );

    console.log(sessionParticipant);
    const pdfPath = await generatePDF(
      studentInformation,
      classname,
      sessionInformation,
      sessionParticipant
    );
    const absolutePath = path.resolve(pdfPath);

    res.download(absolutePath, "student-report.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

module.exports = {
  getStudentReport,
  sendEmailSubmit,
};
