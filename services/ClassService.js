const { Class } = require("../models");

async function findAll() {
  try {
    const classes = await Class.findAll();
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
    const { className } = req.body;

    const newClass = await Class.create({ className });
    return {
      status: 200,
      message: "Class created successfully",
      data: newClass,
    };
  } catch (error) {
    throw new Error(`Error creating class: ${error.message}`);
  }
}

async function getClassDetaiById(id) {
  try {
    const classDetail = await Class.findOne({
      where: { id },
      include: ["Session"],
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

    const [updatedRows] = await Class.update(className, {
      where: { id: classId },
    });
    if (updatedRows === 0) {
      throw new Error(`Class with id ${id} not found or no changes made`);
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

async function remove(id) {
  try {
    const deletedRows = await Class.destroy({ where: { id } });
    if (deletedRows === 0) {
      throw new Error(`Class with id ${id} not found`);
    }
    return `Class with id ${id} deleted successfully`;
  } catch (error) {
    throw new Error(`Error deleting class: ${error.message}`);
  }
}

module.exports = {
  findAll,
  createClass,
  updateClass,
  getClassDetaiById,
  remove,
};
