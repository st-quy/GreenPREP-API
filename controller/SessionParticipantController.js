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
const getParticipantsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await SessionParticipantService.getParticipantsByUserId(
      userId
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error fetching participants by User:", error.stack);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};

module.exports = {
  getAllParticipants,
  getParticipantsByUserId,
};
