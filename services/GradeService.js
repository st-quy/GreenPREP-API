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

async function calculatePoints(req) {
  try {
    const { StudentID, TopicID, SessionParticipantID, skillName } = req.body;

    if (!StudentID || !TopicID || !SessionParticipantID || !skillName) {
      return {
        status: 400,
        message:
          "Missing required fields: StudentID, TopicID, SessionParticipantID, or skillName",
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
      where: { StudentID, TopicID },
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
      }
    });

    await SessionParticipant.update(
      { [formattedSkillName]: totalPoints },
      { where: { ID: SessionParticipantID, UserID: StudentID } }
    );

    const updatedSessionParticipant = await SessionParticipant.findOne({
      where: { ID: SessionParticipantID, UserID: StudentID },
    });

    return {
      status: 200,
      message: "Points calculated successfully",
      points: totalPoints,
      sessionParticipant: updatedSessionParticipant,
    };
  } catch (error) {
    throw new Error(`Error calculating points: ${error.message}`);
  }
}

async function calculatePointForSpeaking(req) {
  try {
    const { sessionParticipantID, speakingGrades } = req.body;

    if (!sessionParticipantID || !Array.isArray(speakingGrades)) {
      throw new Error(
        "Missing or invalid required fields: sessionParticipantID or speakingGrades"
      );
    }

    const answerIds = speakingGrades.map((grade) => grade.studentAnswerId);

    // Truy vấn tất cả câu trả lời 1 lần
    const studentAnswers = await StudentAnswer.findAll({
      where: { ID: answerIds },
      include: [{ model: Question, include: [Skill] }],
    });

    // Tạo Map để tra cứu nhanh
    const answerMap = new Map();
    studentAnswers.forEach((ans) => answerMap.set(ans.ID, ans));

    let totalPoints = 0;

    for (const grade of speakingGrades) {
      const { studentAnswerId, teacherGradedScore } = grade;

      const studentAnswer = answerMap.get(studentAnswerId);
      if (!studentAnswer) {
        throw new Error(`Student answer with ID ${studentAnswerId} not found`);
      }

      if (studentAnswer.Question.Skill.Name !== "SPEAKING") {
        throw new Error(
          `Student answer with ID ${studentAnswerId} is not for speaking`
        );
      }

      if (typeof teacherGradedScore !== "number" || teacherGradedScore < 0) {
        throw new Error(`Invalid score for studentAnswerId ${studentAnswerId}`);
      }

      totalPoints += teacherGradedScore;
    }

    await SessionParticipant.update(
      { Speaking: totalPoints },
      { where: { ID: sessionParticipantID } }
    );

    return {
      status: 200,
      message: "Speaking points calculated successfully",
      totalPoints,
    };
  } catch (error) {
    return {
      status: 400,
      message: `Error calculating speaking points: ${error.message}`,
    };
  }
}

async function calculatePointForWriting(req) {
  const { sessionParticipantID, studentAnswerId, teacherGradedScore } =
    req.body;
  try {
    if (!sessionParticipantID || !studentAnswerId || !teacherGradedScore) {
      return {
        status: 400,
        message:
          "Missing or invalid required fields: sessionParticipantID, studentAnswerId, or teacherGradedScore",
      };
    }

    const studentAnswer = await StudentAnswer.findOne({
      where: { ID: studentAnswerId },
      include: [{ model: Question, include: [Skill] }],
    });

    if (!studentAnswer) {
      return {
        status: 404,
        message: "Student answer not found with the provided studentAnswerId",
      };
    }

    if (studentAnswer.Question.Skill.Name !== "WRITING") {
      return {
        status: 400,
        message: "Student answer is not a WRITING skill",
      };
    }

    if (typeof teacherGradedScore !== "number" || teacherGradedScore < 0) {
      return {
        status: 400,
        message: "Invalid teacher graded score",
      };
    }
    const totalPoints = teacherGradedScore;
    await SessionParticipant.update(
      { Writing: totalPoints },
      { where: { ID: sessionParticipantID } }
    );

    const updatedSessionParticipant = await SessionParticipant.findOne({
      where: { ID: sessionParticipantID },
    });
    return {
      status: 200,
      message: "Writing points calculated successfully",
      totalPoints,
      sessionParticipant: updatedSessionParticipant,
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
  calculatePointForSpeaking,
  calculatePointForWriting,
};
