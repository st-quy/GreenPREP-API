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
    const { sessionParticipantId, skillName } = req.query;

    if (!sessionParticipantId || !skillName) {
      return {
        status: 400,
        message: "Missing required fields: sessionParticipantId or skillName",
      };
    }

    const sessionParticipant = await SessionParticipant.findByPk(
      sessionParticipantId,
      {
        include: [
          { model: User },
          { model: Session, include: [{ model: Topic }] },
        ],
      }
    );

    if (!sessionParticipant) {
      return {
        status: 404,
        message: "Session participant not found",
      };
    }

    const topic = await Topic.findByPk(sessionParticipant.Session.examSet, {
      include: [
        {
          model: Part,
          required: true,
          include: [
            {
              model: Question,
              required: true,
              include: [
                {
                  model: Skill,
                  where: {
                    Name: skillName.toUpperCase(),
                  },
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!topic) {
      return {
        status: 404,
        message: "Topic not found",
      };
    }

    // Filter parts that have non-empty Questions array
    topic.Parts = topic.Parts.filter(
      (part) => part.Questions && part.Questions.length > 0
    );

    const studentAnswers = await StudentAnswer.findAll({
      where: {
        StudentID: sessionParticipant.UserID,
        TopicID: sessionParticipant.Session.examSet,
      },
      include: [
        {
          model: Question,
          include: [
            {
              model: Skill,
              where: {
                Name: skillName.toUpperCase(),
              },
              required: true,
            },
          ],
        },
      ],
    });

    const answerMap = new Map();
    studentAnswers.forEach((answer) => {
      answerMap.set(answer.QuestionID, answer);
    });

    topic.Parts = topic.Parts.map((part) => {
      part.Questions = part.Questions.map((question) => {
        const studentAnswer = answerMap.get(question.ID);
        if (studentAnswer) {
          question.dataValues.studentAnswer = studentAnswer;
        }
        return question;
      });
      return part;
    });

    return {
      status: 200,
      data: {
        topic,
      },
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
        const correctAnswers = correctContent.correctAnswer;

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
  const {
    sessionParticipantID,
    teacherGradedScore,
    skillName,
    studentAnswers,
  } = req.body;
  try {
    if (
      !sessionParticipantID ||
      typeof teacherGradedScore !== "number" ||
      teacherGradedScore < 0 ||
      !skillName
    ) {
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

    if (studentAnswers) {
      studentAnswers.forEach(({ studentAnswerId }, index) => {
        if (!studentAnswerId) {
          throw new Error(`Missing studentAnswerId at index ${index}`);
        }
      });

      const studentAnswerData = studentAnswers.filter(
        ({ messageContent }) =>
          messageContent !== null &&
          messageContent !== undefined &&
          messageContent.trim() !== ""
      );
      await Promise.all(
        studentAnswerData.map(({ studentAnswerId, messageContent }) =>
          StudentAnswer.update(
            { Comment: messageContent },
            { where: { ID: studentAnswerId } }
          )
        )
      );
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
      data: {
        sessionParticipant: updatedSessionParticipant[formattedSkillName],
      },
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
