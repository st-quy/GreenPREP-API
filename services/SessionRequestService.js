const { SESSION_REQUEST_STATUS } = require("../helpers/constants");
const { Session, SessionRequest, SessionParticipant } = require("../models");
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
      include: ["User"],
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
    const { requestId } = req.query;

    const status = req.query.status;

    const whereClause = {
      UserID: studentId,
      SessionID: sessionId,
      ID: requestId,
    };
    if (Object.values(SESSION_REQUEST_STATUS).includes(status)) {
      whereClause.status = status;
    }

    const sessionRequest = await SessionRequest.findOne({
      where: whereClause,
    });
    if (!sessionRequest) {
      throw new Error("Session request not found");
    }

    if (sessionRequest.status === SESSION_REQUEST_STATUS.APPROVED) {
      const sessionParticipant = await SessionParticipant.findOne({
        where: {
          UserID: studentId,
          SessionID: sessionId,
        },
        include: ["Session"],
      });

      if (!sessionParticipant) {
        throw new Error(
          `Session participant with studentId ${studentId} and ${sessionId} not found`
        );
      }
      return {
        status: 200,
        data: {
          sessionParticipant,
          sessionRequest,
        },
      };
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
    const { UserID, sessionKey } = req.body;

    const session = await Session.findOne({ where: { sessionKey } });
    if (!session) {
      return {
        status: 400,
        message: "Session not found with sessionKey: " + sessionKey,
      };
    }

    const checks = await Promise.all(
      [SESSION_REQUEST_STATUS.APPROVED, SESSION_REQUEST_STATUS.PENDING].map(
        (status) =>
          SessionRequest.findOne({
            where: { UserID: UserID, SessionID: session.ID, status },
          })
      )
    );

    if (checks.filter(Boolean).length > 0) {
      throw new Error("Session request already exists");
    }

    const allSessionRequest = await SessionRequest.findAll({
      where: {
        UserID: UserID,
        SessionID: session.ID,
        status: SESSION_REQUEST_STATUS.REJECTED,
      },
    });

    if (allSessionRequest.length >= 3) {
      throw new Error("Session request limit reached");
    }

    const sessionRequest = await SessionRequest.create({
      UserID: UserID,
      SessionID: session.ID,
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
