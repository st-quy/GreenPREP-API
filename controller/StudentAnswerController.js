const StudentAnswerService = require("../services/StudentAnswerService");

const storeStudentAnswerByPart = async (req, res) => {
  try {
    const { studentId, topicId, questions } = req.body;
    if (!studentId || !topicId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid data format" });
    }
    const result = await StudentAnswerService.storeStudentAnswerByPart(req);
    res.status(result.status).json(result.message);
  } catch (error) {
    console.error("Error saving student answers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { storeStudentAnswerByPart };
