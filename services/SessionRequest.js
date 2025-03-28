const { Session, SessionRequest } = require("../models");

async function createSessionRequest(req) {
  try {
    const { studentId, sessionId, sessionKey } = req.body;

    const session = await Session.findOne({ where: { ID: sessionId } });
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.sessionKey !== sessionKey) {
      throw new Error("Invalid session key");
    }

    const sessionRequest = await SessionRequest.create({
      UserID: studentId,
      SessionID: sessionId,
    });

    return {
      status: 201,
      data: sessionRequest,
    };
  } catch (errort) {
    throw new Error(`Error creating session request: ${error.message}`);
  }
}

async function approveSessionRequest(req) {
  try {
    const { requestId } = req.params;

    const sessionRequest = await SessionRequest.findOne({
      where: { ID: requestId },
    });
    if (!sessionRequest) {
      throw new Error("Session request not found");
    }

    sessionRequest.status = true;
    await sessionRequest.save();

    return {
      status: 200,
      data: sessionRequest,
    };
  } catch (error) {
    throw new Error(`Error approving session request: ${error.message}`);
  }
}

module.exports = {
  createSessionRequest,
  approveSessionRequest,
};
