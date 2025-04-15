const { StudentAnswer, Session } = require("../models");
const { calculatePoints } = require("../services/GradeService");

/**
 * Validate incoming questions array
 */
function validateQuestions(questions) {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error("Questions are required and must be a non-empty array");
  }

  questions.forEach(({ questionId }, index) => {
    if (!questionId) {
      throw new Error(`Missing questionId at index ${index}`);
    }
  });
}

/**
 * Main handler to store student answers and calculate points
 */
async function storeStudentAnswers(req) {
  const { studentId, topicId, sessionId, questions, skillName } = req.body;

  if (!studentId) throw new Error("Student ID is required");
  if (!topicId) throw new Error("Topic ID is required");
  if (!sessionId) throw new Error("Session ID is required");

  validateQuestions(questions);

  const studentAnswers = questions.map(
    ({ questionId, answerText, answerAudio }) => ({
      StudentID: studentId,
      TopicID: topicId,
      QuestionID: questionId,
      SessionID: sessionId,
      AnswerText: Array.isArray(answerText)
        ? JSON.stringify(answerText)
        : answerText,
      AnswerAudio: answerAudio,
    })
  );

  const questionIDs = studentAnswers.map((a) => a.QuestionID);

  const existing = await StudentAnswer.findOne({
    where: {
      StudentID: studentId,
      SessionID: sessionId,
      QuestionID: questionIDs,
    },
  });

  try {
    let savedAnswers = [];
    if (existing) {
      await Promise.all(
        studentAnswers.map((answer) =>
          StudentAnswer.update(
            {
              AnswerText: answer.AnswerText,
              AnswerAudio: answer.AnswerAudio,
            },
            {
              where: {
                StudentID: answer.StudentID,
                SessionID: answer.SessionID,
                QuestionID: answer.QuestionID,
              },
            }
          )
        )
      );
    } else {
      savedAnswers = await StudentAnswer.bulkCreate(studentAnswers);
    }

    // Then calculate points based on the answers
    if (skillName === "WRITING" || skillName === "SPEAKING") {
      return {
        status: 200,
        message: "Student answers saved and points calculated successfully",
        data: {
          savedAnswersCount: savedAnswers.length,
        },
      };
    }

    const pointData = await calculatePoints(req);

    return {
      status: 200,
      message: "Student answers saved and points calculated successfully",
      data: {
        savedAnswersCount: savedAnswers.length,
        pointData,
      },
    };
  } catch (error) {
    throw new Error(
      "Error saving answers or calculating points: " + error.message
    );
  }
}

module.exports = { storeStudentAnswers };
