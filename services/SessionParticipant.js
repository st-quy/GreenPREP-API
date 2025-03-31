const { SessionParticipant } = require("../models");

async function addParticipant(req) {
  try {
    const { userId, studentName } = req.body;
    const { sessionId } = req.params;
    const participant = await SessionParticipant.create({
      studentName,
      SessionID: sessionId,
      userId,
      isApproved: true,
      UserID: userId,
    });
    return {
      status: 201,
      message: "Participant added successfully",
      data: participant,
    };
  } catch (error) {
    console.error("Error adding participant:", error);
    throw error;
  }
}

const getParticipantsByUserId = async (userId) => {
  const participants = await SessionParticipant.findAll({
    where: { UserID: userId },
  });

  if (!participants.length) {
    return { status: 404, message: "No participants found for the given user" };
  }

  return { status: 200, message: "Participants retrieved successfully", data: participants };
};

module.exports = {
  addParticipant,
  getParticipantsByUserId,
};