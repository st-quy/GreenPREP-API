const { StudentAnswerDraft } = require("../models");
/**
 * Main handler to store student answers and calculate points
 */
async function storeStudentAnswerDraft(req) {
  try {
    const { studentId, topicId, question } = req.body;

    if (!studentId || !topicId || !question || typeof question !== "object") {
      throw new Error("Missing or invalid studentId, topicId, or question");
    }

    const { questionId, answerText, answerAudio } = question;

    if (!questionId) {
      return {
        status: 400,
        message: "Question must have a questionId",
      };
    }

    const studentAnswer = {
      StudentID: studentId,
      TopicID: topicId,
      QuestionID: questionId,
      AnswerText: Array.isArray(answerText)
        ? JSON.stringify(answerText)
        : answerText || null,
      AnswerAudio: answerAudio || null,
    };

    await StudentAnswerDraft.create(studentAnswer);

    return {
      status: 200,
      message: "Stored StudentAnswer successfully",
    };
  } catch (error) {
    return {
      status: 400,
      message: "Error saving answer: " + error.message,
    };
  }
}

module.exports = { storeStudentAnswerDraft };
