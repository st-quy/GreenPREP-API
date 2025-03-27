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
