const express = require("express");
const router = express.Router();

const {
  getAllSessionsByClass,
  createSession,
  updateSession,
  getSessionDetailById,
  removeSession,
  generateSessionKey,
} = require("../controller/SessionController");

router.get("/", getAllSessionsByClass);
router.post("/", createSession);
router.put("/:classId", updateSession);
router.get("/:classId", getSessionDetailById);
router.delete("/:classId", removeSession);
router.get("/generate-key", generateSessionKey);

module.exports = router;
