const { SESSION_REQUEST_STATUS } = require("../helpers/constants");
const { Session, SessionRequest } = require("../models");
const { addParticipant } = require("./SessionParticipantService");

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
async function getAllSessionRequests(req) {
  try {
    const { sessionId } = req.params;
    const status = req.query.status;

    const whereClause = { SessionID: sessionId };
    if (Object.values(SESSION_REQUEST_STATUS).includes(status)) {
      whereClause.status = status;
    }
    const sessionRequests = await SessionRequest.findAll({
      where: whereClause,
    });
    return {
      status: 200,
      data: sessionRequests,
    };
  } catch (error) {
    throw new Error(`Error getting session requests: ${error.message}`);
  }
}

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
async function getSessionRequestByStudentId(req) {
  try {
    const { sessionId, studentId } = req.params;
    const status = req.query.status;

    const whereClause = { UserID: studentId, SessionID: sessionId };
    if (Object.values(SESSION_REQUEST_STATUS).includes(status)) {
      whereClause.status = status;
    }

    const sessionRequest = await SessionRequest.findOne({
      where: whereClause,
    });
    if (!sessionRequest) {
      throw new Error("Session request not found");
    }
    return {
      status: 200,
      data: sessionRequest,
    };
  } catch (error) {
    throw new Error(`Error getting session request: ${error.message}`);
  }
}

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
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

    const isExisted = await Promise.any(
      [SESSION_REQUEST_STATUS.APPROVED, SESSION_REQUEST_STATUS.PENDING].map(
        (status) =>
          SessionRequest.findOne({
            where: { UserID: studentId, SessionID: sessionId, status },
          })
      )
    );

    if (isExisted) {
      throw new Error("Session request already exists");
    }

    const sessionRequest = await SessionRequest.create({
      UserID: studentId,
      SessionID: sessionId,
    });

    return {
      status: 201,
      message: "Session request created successfully",
      data: sessionRequest,
    };
  } catch (error) {
    throw new Error(`Error creating session request: ${error.message}`);
  }
}

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
async function approveSessionRequest(req) {
  try {
    const { sessionId } = req.params;
    const { requestId } = req.body;

    const sessionRequest = await SessionRequest.findOne({
      where: { ID: requestId, SessionID: sessionId },
    });
    if (
      !sessionRequest ||
      sessionRequest.status !== SESSION_REQUEST_STATUS.PENDING
    ) {
      throw new Error("Session request not found");
    }

    sessionRequest.status = SESSION_REQUEST_STATUS.APPROVED;
    await sessionRequest.save();

    await addParticipant(sessionId, sessionRequest.UserID);

    return {
      status: 200,
      message: "Session request approved successfully",
      data: sessionRequest,
    };
  } catch (error) {
    throw new Error(`Error approving session request: ${error.message}`);
  }
}

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
async function rejectSessionRequest(req) {
  try {
    const { sessionId } = req.params;
    const { requestId } = req.body;

    const sessionRequest = await SessionRequest.findOne({
      where: { ID: requestId, SessionID: sessionId },
    });
    if (
      !sessionRequest ||
      sessionRequest.status !== SESSION_REQUEST_STATUS.PENDING
    ) {
      throw new Error("Session request not found");
    }

    sessionRequest.status = SESSION_REQUEST_STATUS.REJECTED;
    await sessionRequest.save();

    return {
      status: 200,
      message: "Session request rejected successfully",
      data: sessionRequest,
    };
  } catch (error) {
    throw new Error(`Error rejecting session request: ${error.message}`);
  }
}

module.exports = {
  getAllSessionRequests,
  getSessionRequestByStudentId,
  createSessionRequest,
  approveSessionRequest,
  rejectSessionRequest,
};
