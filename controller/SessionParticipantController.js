const SessionParticipantService = require("../services/SessionParticipantService");

async function getAllParticipants(req, res) {
  try {
    const participants = await SessionParticipantService.getAllParticipants(
      req
    );
    return res.status(participants.status).json(participants);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllParticipants,
};
