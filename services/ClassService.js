const { Class, sequelize } = require("../models");

async function findAll() {
  try {
    const classes = await Class.findAll({
      include: [
        {
          association: "Sessions",
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal('(SELECT COUNT(*) FROM "Sessions" WHERE "Sessions"."ClassID" = "Classes"."ID")'),
            'numberOfSessions'
          ]
        ]
      }
    });
    return {
      status: 200,
      message: "Classes fetched successfully",
      data: classes,
    };
  } catch (error) {
    throw new Error(`Error fetching classes: ${error.message}`);
  }
}

async function createClass(req) {
  try {
    const { className, UserID } = req.body;

    const newClass = await Class.create({ className, UserID });

    return {
      status: 200,
      message: "Class created successfully",
      data: newClass,
    };
  } catch (error) {
    throw new Error(`Error creating class: ${error.message}`);
  }
}

async function getClassDetailById(req) {
  try {
    const { classId } = req.params;

    const classDetail = await Class.findOne({
      where: { ID: classId },
      include: [
        {
          association: "Sessions",
          include: [
            {
              association: "SessionParticipants",
            },
          ],
        },
      ],
    });

    if (!classDetail) {
      throw new Error(`Class with id ${classId} not found`);
    }

    return {
      status: 200,
      message: "Class details fetched successfully",
      data: classDetail,
    };
  } catch (error) {
    throw new Error(`Error fetching class details: ${error.message}`);
  }
}

async function updateClass(req) {
  try {
    const { className } = req.body;
    const { classId } = req.params;

    if (!className) {
      throw new Error("Class name is required");
    }

    const [updatedRows] = await Class.update(
      { className },
      {
        where: { ID: classId },
      }
    );
    if (updatedRows === 0) {
      throw new Error(`Class with id ${classId} not found or no changes made`);
    }
    return {
      status: 200,
      message: "Class updated successfully",
      data: updatedRows,
    };
  } catch (error) {
    throw new Error(`Error updating class: ${error.message}`);
  }
}

async function remove(req) {
  try {
    const { classId } = req.params;
    const deletedRows = await Class.destroy({ where: { ID: classId } });
    if (deletedRows === 0) {
      throw new Error(`Class with id ${classId} not found`);
    }
    return `Class with id ${classId} deleted successfully`;
  } catch (error) {
    throw new Error(`Error deleting class: ${error.message}`);
  }
}

module.exports = {
  findAll,
  createClass,
  updateClass,
  getClassDetailById,
  remove,
};
