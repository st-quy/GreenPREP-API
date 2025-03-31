const { Session } = require("../models");

async function getSessionByClass(req) {
  try {
    const { sessionName, status, page = 1, limit = 10 } = req.body;
    const { id } = req.params;

    const offset = (page - 1) * limit;
    const whereClause = {
      ClassID: id,
    };

    if (sessionName) {
      whereClause.sessionName = sessionName;
    }

    if (status) {
      whereClause.status = status;
    }

    const classes = await Session.findAndCountAll({
      where: whereClause,
      limit,
      offset,
    });
    return {
      status: 200,
      data: classes.rows,
      total: classes.count,
      currentPage: page,
      totalPages: Math.ceil(classes.count / limit),
    };
  } catch (error) {
    throw new Error(
      `Error fetching classes by sessionName and status with pagination: ${error.message}`
    );
  }
}

async function createSession(req) {
  try {
    const { sessionName, sessionKey, startTime, endTime, examSet } = req.body;
    const { classId } = req.params;

    const sessionData = {
      sessionName,
      sessionKey,
      startTime,
      endTime,
      examSet,
      ClassID: classId,
    };
    const newSession = await Session.create(sessionData);
    return {
      status: 201,
      data: newSession,
    };
  } catch (error) {
    throw new Error(`Error creating session: ${error.message}`);
  }
}

async function updateSession(req) {
  try {
    const { id } = req.params;
    const { sessionName, sessionKey, startTime, endTime, examSet } = req.body;

    const session = await Session.update(
      { sessionName, sessionKey, startTime, endTime, examSet },
      { where: { ID: id } }
    );
    if (!session) {
      return {
        status: 404,
        message: "Session not found",
      };
    }

    return {
      status: 200,
      data: updatedSession,
    };
  } catch (error) {
    throw new Error(`Error updating session: ${error.message}`);
  }
}

async function getSessionDetailById(id) {
  try {
    const session = await Session.findOne({
      where: { ID: id },
      include: ["SesionParticipant"],
    });

    if (!session) {
      return {
        status: 404,
        message: "Session not found",
      };
    }

    return {
      status: 200,
      data: session,
    };
  } catch (error) {
    throw new Error(`Error fetching session detail: ${error.message}`);
  }
}

async function removeSession(id) {
  try {
    const deletedCount = await Session.destroy({
      where: { ID: id },
    });

    if (deletedCount === 0) {
      return {
        status: 404,
        message: "Session not found",
      };
    }

    return {
      status: 200,
      message: "Session deleted successfully",
    };
  } catch (error) {
    throw new Error(`Error deleting session: ${error.message}`);
  }
}

function generateSessionKey() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let sessionKey = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    sessionKey += characters[randomIndex];
  }
  return {
    status: 200,
    data: sessionKey,
  };
}

module.exports = {
  getSessionByClass,
  createSession,
  updateSession,
  getSessionDetailById,
  removeSession,
  generateSessionKey,
};
