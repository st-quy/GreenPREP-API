const { Op, where } = require("sequelize");
const {
  Session,
  SessionParticipant,
  StudentAnswer,
  User,
  Topic,
  Question,
  Part,
  Skill,
} = require("../models"); // Ensure models are imported
const { skillMapping, pointsPerQuestion } = require("../helpers/constants");

async function getParticipantExamBySession(req) {
  try {
    const { sessionId, studentId, skillName } = req.query;

    if (!sessionId) {
      throw new Error("sessionId is required");
    }

    if (!studentId) {
      throw new Error("studentId is required");
    }

    const sessionParticipant = await SessionParticipant.findOne({
      where: {
        SessionID: sessionId,
        UserID: studentId,
        approvedAt: {
          [Op.ne]: null,
        },
      },
    });

    if (!sessionParticipant) {
      throw new Error(
        `Participant with id ${studentId} not found in session with id ${sessionId}`
      );
    }

    const studentAnswers = await StudentAnswer.findAll({
      where: {
        StudentID: studentId,
      },
      include: [
        {
          model: User,
        },
        {
          model: Topic,
        },
        {
          model: Question,
          where: {
            Type: skillName,
          },
          include: [
            {
              model: Part,
            },
          ],
        },
      ],
    });

    if (!studentAnswers) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    return {
      status: 200,
      message: "Participant exams fetched successfully",
      data: studentAnswers,
    };
  } catch (error) {
    throw new Error(`Error fetching participant exams: ${error.message}`);
  }
}

async function calculateTotalPoints(
  sessionParticipantId,
  skillName,
  skillScore
) {
  try {
    const participant = await SessionParticipant.findOne({
      where: { ID: sessionParticipantId },
    });

    if (!participant) {
      return {
        status: 404,
        message: "Session participant not found",
      };
    }

    const listening =
      skillName === skillMapping.LISTENING
        ? skillScore
        : participant.Listening || 0;
    const reading =
      skillName === skillMapping.READING
        ? skillScore
        : participant.Reading || 0;
    const writing =
      skillName === skillMapping.WRITING
        ? skillScore
        : participant.Writing || 0;
    const speaking =
      skillName === skillMapping.SPEAKING
        ? skillScore
        : participant.Speaking || 0;

    const totalPoints = listening + reading + writing + speaking;

    if (skillName === skillMapping["GRAMMAR AND VOCABULARY"]) {
      await SessionParticipant.update(
        { [skillName]: skillScore },
        { where: { ID: sessionParticipantId } }
      );
    } else {
      await SessionParticipant.update(
        { [skillName]: skillScore, Total: totalPoints },
        { where: { ID: sessionParticipantId } }
      );
    }

    return {
      totalPoints,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function calculatePoints(req) {
  try {
    const { studentId, topicId, sessionParticipantId, skillName } = req.body;

    if (!studentId || !topicId || !sessionParticipantId || !skillName) {
      return {
        status: 400,
        message:
          "Missing required fields: studentId, topicId, sessionParticipantId, or skillName",
      };
    }

    const formattedSkillName = skillMapping[skillName.toUpperCase()] || null;

    if (!formattedSkillName) {
      return {
        status: 400,
        message: `Invalid skill name: ${skillName}`,
      };
    }
    const pointPerQuestion =
      pointsPerQuestion[formattedSkillName.toLowerCase()] || 1;

    const answers = await StudentAnswer.findAll({
      where: { StudentID: studentId, TopicID: topicId },
      include: [{ model: Question, include: [Skill] }],
    });

    if (answers.length === 0) {
      return {
        status: 404,
        message: "No answers found for the student",
      };
    }

    let totalPoints = 0;

    answers.forEach((answer) => {
      if (!answer.AnswerText) {
        return;
      }

      const typeOfQuestion = answer.Question.Type;
      const skillType = answer.Question.Skill.Name;

      if (skillType !== skillName) {
        return;
      }

      const correctContent = answer.Question.AnswerContent;

      if (typeOfQuestion === "multiple-choice") {
        if (correctContent.correctAnswer === answer.AnswerText) {
          totalPoints += pointPerQuestion;
        }
      } else if (typeOfQuestion === "matching") {
        const studentAnswers = JSON.parse(answer.AnswerText);
        const correctAnswers = correctContent.correctAnswers;

        correctAnswers.forEach((correct) => {
          const matched = studentAnswers.find(
            (student) =>
              student.left === correct.left && student.right === correct.right
          );
          if (matched) {
            totalPoints += pointPerQuestion;
          }
        });
      } else if (typeOfQuestion === "ordering") {
        const studentAnswers = JSON.parse(answer.AnswerText);
        const correctAnswers = correctContent.correctAnswer;

        const minLength = Math.min(
          studentAnswers.length,
          correctAnswers.length
        );

        for (let i = 0; i < minLength; i++) {
          if (studentAnswers[i].key === correctAnswers[i].key) {
            totalPoints += pointPerQuestion;
          }
        }
      } else if (typeOfQuestion === "dropdown-list") {
        const studentAnswers = JSON.parse(answer.AnswerText);
        const correctAnswers = correctContent.correctAnswer;

        correctAnswers.forEach((correct) => {
          const student = studentAnswers.find((s) => s.key === correct.key);
          if (student && student.value === correct.value) {
            totalPoints += pointPerQuestion;
          }
        });
      } else if (typeOfQuestion === "listening-questions-group") {
        const studentAnswers = JSON.parse(answer.AnswerText);
        const correctList = correctContent.groupContent.listContent;

        correctList.forEach((question) => {
          const studentAnswer = studentAnswers.find(
            (ans) => ans.ID === question.ID
          );
          if (
            studentAnswer &&
            studentAnswer.answer === question.correctAnswer
          ) {
            totalPoints += pointPerQuestion;
          }
        });
      }
    });

    totalPoints = parseFloat(totalPoints.toFixed(3));

    await calculateTotalPoints(
      sessionParticipantId,
      formattedSkillName,
      totalPoints
    );

    const updatedSessionParticipant = await SessionParticipant.findOne({
      where: { ID: sessionParticipantId, UserID: studentId },
    });

    return {
      message: "Points calculated successfully",
      points: totalPoints,
      sessionParticipant: updatedSessionParticipant,
    };
  } catch (error) {
    throw new Error(`Error calculating points: ${error.message}`);
  }
}

async function calculatePointForWritingAndSpeaking(req) {
  const { sessionParticipantID, teacherGradedScore, skillName } = req.body;
  try {
    if (!sessionParticipantID || !teacherGradedScore || !skillName) {
      return {
        status: 400,
        message:
          "Missing or invalid required fields: sessionParticipantID, teacherGradedScore or skillName",
      };
    }

    if (skillName !== "WRITING" && skillName !== "SPEAKING") {
      return {
        status: 400,
        message: `Invalid skill name: ${skillName}`,
      };
    }

    if (typeof teacherGradedScore !== "number" || teacherGradedScore < 0) {
      return {
        status: 400,
        message: "Invalid teacher graded score",
      };
    }

    const totalPoints = teacherGradedScore;
    const formattedSkillName = skillMapping[skillName.toUpperCase()] || null;
    await calculateTotalPoints(
      sessionParticipantID,
      formattedSkillName,
      totalPoints
    );

    const updatedSessionParticipant = await SessionParticipant.findOne({
      where: { ID: sessionParticipantID },
    });
    return {
      status: 200,
      message: "Writing points calculated successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: `Internal server error: ${error.message}`,
    };
  }
}

module.exports = {
  getParticipantExamBySession,
  calculatePoints,
  calculatePointForWritingAndSpeaking,
};
