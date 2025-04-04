const { Topic, Part, Question, Skill } = require("../models");
const { Op } = require("sequelize");

const getTopicWithRelations = async (req, res) => {
  try {
    const topicId = req.params.id;
    const { questionType, skillName } = req.query;

    const questionFilter = {};
    if (questionType) {
      questionFilter.Type = questionType;
    }

    const skillFilter = {};
    if (skillName) {
      skillFilter.Name = skillName;
    }

    const topic = await Topic.findOne({
      where: { ID: topicId },
      include: [
        {
          model: Part,
          include: [
            {
              model: Question,
              where: questionFilter,
              include: [
                {
                  model: Skill,
                  where: skillFilter,
                },
                {
                  model: Part, // Include Part details in Question
                },
              ],
            },
          ],
        },
      ],
    });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json(topic);
  } catch (error) {
    console.error("Error fetching topic with relations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getTopicWithRelations };
