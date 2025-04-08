const StudentAnswerService = require("../services/StudentAnswerService");

const storeStudentAnswers = async (req, res) => {
  try {
    const { studentId, topicId, questions } = req.body;
    if (!studentId || !topicId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid data format" });
    }
<<<<<<< HEAD
    const result = await StudentAnswerService.storeStudentAnswer(req);
=======
    const result = await StudentAnswerService.storeStudentAnswers(req);
>>>>>>> 25e38201e334c73e1aa714e4c85bb071099240f6
    res.status(result.status).json(result.message);
  } catch (error) {
    console.error("Error saving student answers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { storeStudentAnswers };
