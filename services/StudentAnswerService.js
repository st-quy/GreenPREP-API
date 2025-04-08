const { StudentAnswer } = require("../models");

const storeStudentAnswers = async (req) => {
  try {
    const { studentId, topicId, questions } = req.body;

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

    const result = await StudentAnswer.bulkCreate(studentAnswers, {
      ignoreDuplicates: true,
    });

    console.log("object", result);

    return {
      status: 200,
      message: "Create Student Answer Successfully",
      data: null,
    };
  } catch (error) {
    throw new Error(
      "Error occurred while creating student answer: " + error.message
    );
  }
};

module.exports = { storeStudentAnswers };
