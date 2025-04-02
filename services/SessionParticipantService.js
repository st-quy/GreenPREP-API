const { SessionParticipant } = require("../models");

async function addParticipant(sessionId, userId) {
  try {
    const participant = await SessionParticipant.create({
      SessionID: sessionId,
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

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
async function getAllParticipants(req) {
  try {
    const { sessionId } = req.params;
    const participants = await SessionParticipant.findAll({
      where: { SessionID: sessionId },
      include: ["User"],
    });
    return {
      status: 200,
      data: participants,
    };
  } catch (error) {
    console.error("Error getting participants:", error);
    throw error;
  }
}

const getParticipantsByUserId = async (userId) => {
  const participants = await SessionParticipant.findAll({
    where: { UserID: userId },
  });

  console.log("object", userId);

  if (!participants.length) {
    return { status: 404, message: "No participants found for the given user" };
  }

  return {
    status: 200,
    message: "Participants retrieved successfully",
    data: participants,
  };
};

module.exports = {
  addParticipant,
  getAllParticipants,
  getParticipantsByUserId,
};
