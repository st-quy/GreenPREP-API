const express = require("express");
const router = express.Router();
const { allowAnonymous, authorize } = require("../middleware/AuthMiddleware");

const {
  getExamOfParticipantBySession,
  calculatePointForWritingAndSpeaking,
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
 *         description: The Skill name (writing, speaking)
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the topic
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
/**
 * @swagger
 * /grades/teacher-grade:
 *   post:
 *     summary: Calculate points for writing exam
 *     tags: [Grade]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionParticipantID:
 *                 type: string
 *                 description: The ID of the session participant
 *               teacherGradedScore:
 *                 type: number
 *                 description: The writing or reading score given by teacher
 *               studentAnswerId:
 *                 type: string
 *                 description: The ID of the student answer
 *             required:
 *               - sessionParticipantID
 *               - teacherGradedScore
 *               - studentAnswerId
 *     responses:
 *       200:
 *         description: Writing points calculated successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post("/teacher-grade", calculatePointForWritingAndSpeaking);
module.exports = router;
