const { SessionParticipant, Session, User } = require("../models");

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
    console.error("Error getting participants:", error.message);
    throw error;
  }
}

async function getAllParticipantsGroupedByUser(req) {
  try {
    const participants = await SessionParticipant.findAll({
      include: [
        {
          model: User,
          as: "User",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    const groupedParticipants = participants.reduce((acc, participant) => {
      const userId = participant.UserID;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(participant);
      return acc;
    }, {});

    return {
      status: 200,
      message: "Participants grouped by user retrieved successfully",
      data: groupedParticipants,
    };
  } catch (error) {
    console.error("Error getting participants grouped by user:", error.message);
    throw error;
  }
}

const getParticipantsByUserId = async (userId) => {
  const participants = await SessionParticipant.findAll({
    where: { UserID: userId },
    include: [
      {
        model: Session,
        as: "Session",
      },
      {
        model: User,
        as: "User",
        attributes: { exclude: ["password"] },
      },
    ],
  });

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
  getAllParticipantsGroupedByUser,
};
