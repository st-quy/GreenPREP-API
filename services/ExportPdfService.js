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
          const sessionParticipant = await SessionParticipant.findOne({
            where: {
              UserID: studentId.UserID,
              SessionID: sessionId,
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
            include: [
              {
                model: User,
                attributes: ["ID", "firstName", "lastName", "email", "phone"],
              },
              {
                model: Session,
                attributes: [
                  "ID",
                  "sessionName",
                  "sessionKey",
                  "ClassID",
                  "startTime",
                  "endTime",
                  "status",
                ],
              },
            ],
          });

          sessionInformation = sessionParticipant.Session;
          studentInformation = sessionParticipant.User;

          classInformation = await Class.findOne({
            where: { ID: sessionInformation.ClassID },
            attributes: ["ID", "className"],
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

          const answerMap = studentAnswers.reduce((acc, ans) => {
            acc[ans.QuestionID] = ans;
            return acc;
          }, {});

          const partIDs = [...new Set(questions.map((q) => q.PartID))];
          const parts = await Part.findAll({
            where: { ID: partIDs },
            attributes: ["ID", "Content"],
            raw: true,
          });

          const partMap = parts.reduce((acc, part) => {
            acc[part.ID] = part.Content;
            return acc;
          }, {});

          const result = questions.reduce((acc, question) => {
            const { ID, Content, Type, PartID, ImageKeys } = question;
            const answer = answerMap[ID];

            if (!acc[Type]) acc[Type] = {};
            if (!acc[Type][PartID]) {
              acc[Type][PartID] = {
                PartID,
                ContentPart: partMap[PartID],
                questions: [],
              };
            }

            const questionItem = {
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
            };

            acc[Type][PartID].questions.push(questionItem);
            return acc;
          }, {});

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
