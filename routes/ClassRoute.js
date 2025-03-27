const express = require("express");
const router = express.Router();
const {
  getAllClasses,
  createClass,
  updateClass,
  getClassById,
  deleteClass,
} = require("../controller/ClassController");

router.get("/", getAllClasses);
router.post("/", createClass);
router.put("/:classId", updateClass);
router.get("/:classId", getClassById);
router.delete("/:classId", deleteClass);

module.exports = router;
