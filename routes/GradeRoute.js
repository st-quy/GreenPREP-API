const express = require("express");
const router = express.Router();
const { allowAnonymous, authorize } = require("../middleware/AuthMiddleware");

const {
  calculatePoints,
  getExamOfParticipantBySession, // New controller function
} = require("../controller/GradeController");

/**
 * @swagger
 * /grades/participants:
 *   get:
 *     summary: Get participant exams by session
 *     tags: [Grade]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the session
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the student (optional)
 *       - in: query
 *         name: skillName
 *         schema:
 *           type: string
 *         required: true
 *         description: The Skill name (speaking, writting)
 *     responses:
 *       200:
 *         description: List of participant exams for the session
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   participantId:
 *                     type: string
 *                     description: The ID of the participant
 *                   examId:
 *                     type: string
 *                     description: The ID of the exam
 *                   score:
 *                     type: number
 *                     description: The score of the participant in the exam
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.get("/participants", getExamOfParticipantBySession);
router.post("/score", calculatePoints);

module.exports = router;
