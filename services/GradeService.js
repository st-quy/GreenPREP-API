const { Op } = require("sequelize");
const {
  Session,
  SessionParticipant,
  StudentAnswer,
  User,
  Topic,
  Question,
  Part,
} = require("../models"); // Ensure models are imported

async function getParticipantExamBySession(req) {
  try {
    const { sessionId, studentId, skillName } = req.query;

    if (!sessionId) {
      throw new Error("sessionId is required");
    }

    if (!studentId) {
      throw new Error("studentId is required");
    }

    const sessionParticipant = await SessionParticipant.findOne({
      where: {
        SessionID: sessionId,
        UserID: studentId,
        approvedAt: {
          [Op.ne]: null,
        },
      },
    });

    if (!sessionParticipant) {
      throw new Error(
        `Participant with id ${studentId} not found in session with id ${sessionId}`
      );
    }

    const studentAnswers = await StudentAnswer.findAll({
      where: {
        StudentID: studentId,
      },
      include: [
        {
          model: User,
        },
        {
          model: Topic,
        },
        {
          model: Question,
          where: {
            Type: skillName,
          },
          include: [
            {
              model: Part,
            },
          ],
        },
      ],
    });

    if (!studentAnswers) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    return {
      status: 200,
      message: "Participant exams fetched successfully",
      data: studentAnswers,
    };
  } catch (error) {
    throw new Error(`Error fetching participant exams: ${error.message}`);
  }
}

module.exports = {
  getParticipantExamBySession,
};
