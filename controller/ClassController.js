const ClassService = require("../services/ClassService");

const getAllClasses = async (req, res) => {
  const { teacherId } = req.query;
  try {
    const classData = await ClassService.findAll(teacherId);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(classData.status).json(classData);
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createClass = async (req, res) => {
  try {
    const newClass = await ClassService.createClass(req);

    if (!newClass) {
      return res.status(400).json({ message: "Failed to create class" });
    }

    return res.status(newClass.status).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateClass = async (req, res) => {
  try {
    const updatedClass = await ClassService.updateClass(req);

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(updatedClass.status).json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getClassById = async (req, res) => {
  try {
    const classDetail = await ClassService.getClassDetailById(req);

    if (!classDetail) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(classDetail.status).json(classDetail);
  } catch (error) {
    console.error("Error fetching class detail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteClass = async (req, res) => {
  try {
    const deletedClass = await ClassService.remove(req);

    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllClasses,
  createClass,
  updateClass,
  getClassById,
  deleteClass,
};
