const SessionsService = require("../services/SessionService");

async function getAllSessionsByClass(req, res) {
  try {
    const sessions = await SessionsService.getSessionByClass(req);
    return res.status(sessions.status).json(sessions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function createSession(req, res) {
  try {
    const newSession = await SessionsService.createSession(req);
    return res.status(newSession.status).json(newSession);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function updateSession(req, res) {
  try {
    const updatedSession = await SessionsService.updateSession(req);
    return res.status(updatedSession.status).json(updatedSession);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getSessionDetailById(req, res) {
  try {
    const sessionDetail = await SessionsService.getSessionDetailById(req);
    return res.status(sessionDetail.status).json(sessionDetail);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function removeSession(req, res) {
  try {
    const result = await SessionsService.removeSession(req);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function generateSessionKey(req, res) {
  try {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 10; i++) {
      key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return res.status(200).json({ key });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllSessionsByClass,
  createSession,
  updateSession,
  getSessionDetailById,
  removeSession,
  generateSessionKey,
};
