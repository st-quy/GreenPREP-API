const {
  User,
  Class,
  Session,
  SessionParticipant,
  StudentAnswer,
  Question,
  Part,
} = require("../models");
const { generatePDF } = require("../reports/generate-pdf");
const { sendMailWithAttachment } = require("../services/SendEmailService");

const generateStudentReportAndSendMail = async ({ req }) => {
  try {
    const { sessionId } = req.body;

    const studentIds = await SessionParticipant.findAll({
      where: {
        SessionID: sessionId,
        IsPublished: true,
      },
      attributes: ["UserID"],
    });
    if (studentIds.length === 0) {
      throw new Error("No students found for the given sessionId.");
    }
    await Promise.all(
      studentIds.map(async (studentId) => {
        try {
          const sessionInformation = await Session.findOne({
            where: { ID: sessionId },
            attributes: [
              "ID",
              "sessionName",
              "sessionKey",
              "ClassID",
              "startTime",
              "endTime",
              "status",
            ],
          });

          const classInformation = await Class.findOne({
            where: { ID: sessionInformation.ClassID },
            attributes: ["ID", "className"],
          });

          const studentInformation = await User.findOne({
            where: { ID: studentId.UserID },
            attributes: ["ID", "lastName", "firstName", "email", "phone"],
          });

          const sessionParticipant = await SessionParticipant.findOne({
            where: { UserID: studentId.UserID, SessionID: sessionId },
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

          const studentAnswers = await StudentAnswer.findAll({
            where: { StudentID: studentId.UserID, SessionID: sessionId },
            attributes: ["QuestionID", "AnswerText", "AnswerAudio", "Comment"],
            raw: true,
          });

          const questionIDs = studentAnswers.map((sa) => sa.QuestionID);

          const questions = await Question.findAll({
            where: { ID: questionIDs, Type: ["writing", "speaking"] },
            attributes: ["ID", "Content", "Type", "PartID", "ImageKeys"],
            raw: true,
          });

          const answerMap = {};
          studentAnswers.forEach((ans) => {
            answerMap[ans.QuestionID] = ans;
          });

          const partIDs = [...new Set(questions.map((q) => q.PartID))];
          const parts = await Part.findAll({
            where: { ID: partIDs },
            attributes: ["ID", "Content"],
            raw: true,
          });

          const partMap = {};
          parts.forEach((part) => {
            partMap[part.ID] = part.Content;
          });

          const result = {};
          questions.forEach((question) => {
            const { ID, Content, Type, PartID, ImageKeys } = question;
            const answer = answerMap[ID];
            if (!result[Type]) result[Type] = {};
            if (!result[Type][PartID]) {
              result[Type][PartID] = {
                PartID,
                ContentPart: partMap[PartID],
                questions: [],
              };
            }
            result[Type][PartID].questions.push({
              QuestionID: ID,
              ContentQuestion: Content,
              Comment: answer?.Comment ?? "",
              ...(Type === "writing" && {
                AnswerText: answer?.AnswerText ?? "",
              }),
              ...(Type === "speaking" && {
                AnswerAudio: answer?.AnswerAudio ?? "",
                ImageUrl: ImageKeys?.[0] ?? "",
              }),
            });
          });

          const pdfBuffer = await generatePDF(
            studentInformation,
            classInformation,
            sessionInformation,
            sessionParticipant,
            result
          );

          await sendMailWithAttachment({
            to: studentInformation.email,
            studentName: `${studentInformation.firstName} ${studentInformation.lastName}`,
            sessionName: sessionInformation.sessionName,
            pdfBuffer: pdfBuffer,
          });
        } catch (err) {
          throw new Error(
            `Error generating report for studentId ${studentId.UserID}: ${err.message}`
          );
        }
      })
    );
  } catch (err) {
    throw err;
  }
};

module.exports = {
  generateStudentReportAndSendMail,
};
