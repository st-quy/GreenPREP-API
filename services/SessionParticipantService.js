const { SessionParticipant, Session, User } = require("../models");
const { CEFR_LEVELS } = require("../constants/levels");
const sequelizePaginate = require("sequelize-paginate");
const { generateStudentReportAndSendMail } = require("./ExportPdfService");
const { Op } = require("sequelize");

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
    sequelizePaginate.paginate(SessionParticipant);
    const { sessionId } = req.params;
    const options = {
      page: req.query.page || 1,
      paginate: req.query.limit || 10,
      where: { SessionID: sessionId },
      include: ["User"],
    };
    const result = await SessionParticipant.paginate(options);
    return {
      status: 200,
      message: "Participants retrieved successfully",
      data: result.docs,
      pagination: {
        currentPage: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.limit) || 10,
        itemsOnPage: result.docs.length,
        totalPages: result.pages,
        totalItems: result.total,
      },
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

const publishScoresBySessionId = async (req) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const incompleteStudents = await SessionParticipant.findAll({
    where: {
      SessionID: sessionId,
      [Op.or]: [
        { GrammarVocab: { [Op.is]: null } },
        { Reading: { [Op.is]: null } },
        { ReadingLevel: { [Op.is]: null } },
        { Listening: { [Op.is]: null } },
        { ListeningLevel: { [Op.is]: null } },
        { Writing: { [Op.is]: null } },
        { WritingLevel: { [Op.is]: null } },
        { Speaking: { [Op.is]: null } },
        { SpeakingLevel: { [Op.is]: null } },
        { Total: { [Op.is]: null } },
        { Level: { [Op.is]: null } },
      ],
    },
    attributes: ["UserID"],
  });

  if (incompleteStudents.length > 0) {
    return {
      status: 400,
      message:
        "Some students are missing scores or levels. Please complete the data before publishing.",
    };
  }

  const [updatedCount] = await SessionParticipant.update(
    { IsPublished: true },
    { where: { SessionID: sessionId } }
  );

  if (updatedCount === 0) {
    return {
      status: 404,
      message: "No records updated. Possibly invalid SessionID.",
      data: updatedCount,
    };
  }

  await generateStudentReportAndSendMail({ req });

  return {
    status: 200,
    message: "Scores published successfully.",
    data: updatedCount,
  };
};

const getPublishedSessionParticipantsByUserId = async (req) => {
  const { publish, userId } = req.query;
  if (!publish) {
    throw new Error("Publish parameter is required");
  }
  if (publish !== "true") {
    throw new Error(
      "Publish must be 'true' to retrieve published participants"
    );
  }
  if (!userId) {
    throw new Error("UserID is required");
  }
  const results = await SessionParticipant.findAll({
    where: {
      IsPublished: publish,
      UserID: userId,
    },
  });
  return {
    status: 200,
    message: "Published session participants retrieved successfully.",
    data: results,
  };
};

const updateLevelById = async (req) => {
  try {
    const { newLevel } = req.body;
    const participantId = req.params.id;

    if (!participantId) throw new Error("participantId is required.");
    if (!newLevel) throw new Error("newLevel is required.");

    if (!CEFR_LEVELS.includes(newLevel)) {
      throw new Error(
        `Invalid level: ${newLevel}. Valid levels are: ${CEFR_LEVELS.join(
          ", "
        )}`
      );
    }

    const [affectedRows] = await SessionParticipant.update(
      { Level: newLevel },
      { where: { ID: participantId } }
    );

    if (affectedRows === 0) {
      return {
        status: 404,
        message: `No participant found with ID ${participantId}.`,
      };
    }

    return {
      status: 200,
      message: `Successfully updated level to "${newLevel}".`,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message || "Internal server error.",
    };
  }
};

module.exports = {
  updateLevelById,
  getPublishedSessionParticipantsByUserId,
  publishScoresBySessionId,
  addParticipant,
  getAllParticipants,
  getParticipantsByUserId,
  getAllParticipantsGroupedByUser,
};
