const { StudentAnswer } = require("../models");
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
  const { studentId, topicId, questions } = req.body;

  if (!studentId) throw new Error("Student ID is required");
  if (!topicId) throw new Error("Topic ID is required");

  validateQuestions(questions);

  const studentAnswers = questions.map(
    ({ questionId, answerText, answerAudio }) => ({
      StudentID: studentId,
      TopicID: topicId,
      QuestionID: questionId,
      AnswerText: Array.isArray(answerText)
        ? JSON.stringify(answerText)
        : answerText,
      AnswerAudio: answerAudio,
    })
  );

  try {
    // Save all student answers at once
    const savedAnswers = await StudentAnswer.bulkCreate(studentAnswers, {
      ignoreDuplicates: true,
    });

    // Then calculate points based on the answers
    const pointData = await calculatePoints(req);

    return {
      status: 200,
      message: "Student answers saved and points calculated successfully",
      data: {
        savedAnswersCount: savedAnswers.length,
        pointData,
        studentAnswers: savedAnswers,
      },
    };
  } catch (error) {
    throw new Error(
      "Error saving answers or calculating points: " + error.message
    );
  }
}

module.exports = { storeStudentAnswers };
