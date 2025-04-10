const StudentAnswerDraftService = require("../services/StudentAnswerDraftService");

const storeStudentAnswer = async (req, res) => {
  try {
    const { studentId, topicId, question } = req.body;
    if (!studentId || !topicId || !question) {
      return res.status(400).json({ message: "Invalid data format" });
    }
    const result = await StudentAnswerDraftService.storeStudentAnswer(req);
    res.status(result.status).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error saving student answer:", error);
    res.status(500).json(error.message);
  }
};

module.exports = { storeStudentAnswer };
