const { Sequelize } = require("sequelize");
const { Session, SessionParticipant, Class, Topic } = require("../models");

async function getAllSessions(req) {
  try {
    const sessions = await Session.findAll({
      include: [
        {
          model: Class,
          as: "Classes",
        },
        {
          model: Topic,
          as: "Topic",
        },
      ],
    });
    return {
      status: 200,
      data: sessions,
    };
  } catch (error) {
    throw new Error(`Error fetching all sessions: ${error.message}`);
  }
}

async function getSessionByClass(req) {
  try {
    const { classId, sessionName, status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      ClassID: classId,
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
    const { sessionName, sessionKey, startTime, endTime, examSet, ClassID } =
      req.body;
    if (!sessionName || !sessionKey || !startTime || !endTime || !examSet || !ClassID) {
      return {
        status: 400,
        message:
          "sessionName, sessionKey, startTime, endTime, examSet, and ClassID are required",
      };
    }

    if (startTime > endTime) {
      return {
        status: 400,
        message: "Start time must be before end time",
      };
    }

    const checkExistTopic = await Topic.findByPk(examSet);

    if (!checkExistTopic) {
      return {
        status: 400,
        message: "Topic not found",
      };
    }

    const checkExistClass = await Class.findByPk(ClassID);
    if (!checkExistClass) {
      return {
        status: 400,
        message: "Class not found",
      };
    }

    const checkExistSessionKey = await Session.findOne({
      where: {
        sessionKey,
      },
    });
    if (checkExistSessionKey) {
      return {
        status: 400,
        message: `Session with key ${sessionKey} already exists`,
      };
    }

    const checkExistSessionName = await Session.findOne({
      where: {
        sessionName,
        ClassID,
      },
    });
    
    if (checkExistSessionName) {
      return {
        status: 400,
        message: `Session with name ${sessionName} already exists in this class`,
      };
    }

    let status;
    const now = new Date();
    if (new Date(startTime) > now) {
      status = "NOT_STARTED";
    } else if (new Date(endTime) > now) {
      status = "ON_GOING";
    } else {
      status = "COMPLETE";
    }

    const newSession = await Session.create({
      sessionName,
      sessionKey,
      startTime,
      endTime,
      examSet,
      ClassID,
      status,
    });
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
    const { sessionId } = req.params;
    const { sessionName, sessionKey, startTime, endTime, examSet } = req.body;

    const session = await Session.update(
      { sessionName, sessionKey, startTime, endTime, examSet },
      { where: { ID: sessionId } }
    );
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
    throw new Error(`Error updating session: ${error.message}`);
  }
}

async function getSessionDetailById(req) {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      where: { ID: sessionId },
      include: [
        {
          model: SessionParticipant,
          as: "SessionParticipants",
        },
        {
          model: Class,
          as: "Classes",
        },
        {
          model: Topic,
          as: "Topic",
        },
      ],
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

async function removeSession(req) {
  try {
    const { sessionId } = req.params;
    const deletedCount = await Session.destroy({
      where: { ID: sessionId },
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

async function cronStatusAllSessions() {
  try {
    const now = new Date();
    const sessions = await Session.findAll();
    
    for (const session of sessions) {
      let newStatus;
      
      if (new Date(session.startTime) > now) {
        newStatus = "NOT_STARTED";
      } else if (new Date(session.endTime) > now) {
        newStatus = "ON_GOING";
      } else {
        newStatus = "COMPLETE";
      }

      if (session.status !== newStatus) {
        await Session.update(
          { status: newStatus },
          { where: { ID: session.ID } }
        );
      }
    }

    const updatedSessions = await Session.findAll({
      include: [
        {
          model: Class,
          as: "Classes",
        },
        {
          model: Topic,
          as: "Topic",
        },
      ],
    });

    return {
      status: 200,
      data: updatedSessions,
    };
  } catch (error) {
    throw new Error(`Error updating session statuses: ${error.message}`);
  }
}

module.exports = {
  getAllSessions,
  getSessionByClass,
  createSession,
  updateSession,
  getSessionDetailById,
  removeSession,
  cronStatusAllSessions
};
