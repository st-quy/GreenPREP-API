const GradeService = require("../services/GradeService");

const getExamOfParticipantBySession = async (req, res) => {
  try {
    const classData = await GradeService.getParticipantExamBySession(req);

    if (!classData) {
      return res.status(404).json({ message: "Grade not found" });
    }

    return res.status(classData.status).json(classData);
  } catch (error) {
    console.error("Error fetching grade:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getExamOfParticipantBySession,
};
