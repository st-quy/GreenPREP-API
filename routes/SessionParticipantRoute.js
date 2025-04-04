const express = require("express");
const router = express.Router();
const SessionParticipantController = require("../controller/SessionParticipantController");

/**
 * @swagger
 * components:
 *   schemas:
 *     SessionParticipant:
 *       type: object
 *       properties:
 *         ID:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the session participant
 *         GrammarVocab:
 *           type: integer
 *           nullable: true
 *           description: Score for grammar and vocabulary
 *         Reading:
 *           type: integer
 *           nullable: true
 *           description: Score for reading
 *         Listening:
 *           type: integer
 *           nullable: true
 *           description: Score for listening
 *         Speaking:
 *           type: integer
 *           nullable: true
 *           description: Score for speaking
 *         Writing:
 *           type: integer
 *           nullable: true
 *           description: Score for writing
 *         Total:
 *           type: integer
 *           nullable: true
 *           description: Total score
 *         Level:
 *           type: string
 *           enum: [A1, A2, B1, B2, C1, C2]
 *           nullable: true
 *           description: Proficiency level
 *         SessionID:
 *           type: string
 *           format: uuid
 *           description: Identifier of the associated session
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date and time when the participant was approved
 *         UserID:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Identifier of the associated user (optional)
 *
 *     ApiResponseForSessionParticipantArray:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponseBase'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SessionParticipant'
 *               description: Array of session participants
 */

/**
 * @swagger
 * /session-participants/user/{userId}:
 *   get:
 *     summary: Get all exam history by participant
 *     tags: [SessionParticipants]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve participants for
 *     responses:
 *       200:
 *         description: Participants retrieved successfully
 *       404:
 *         description: No participants found for the given user
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:userId",
  SessionParticipantController.getParticipantsByUserId
);

/**
 * @swagger
 * /session-participants/{sessionId}:
 *   get:
 *     summary: Get all participants for a session
 *     tags: [SessionParticipants]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the session to retrieve participants for
 *     responses:
 *       200:
 *         description: A list of session participants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseForSessionParticipantArray'
 *       500:
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.get("/:sessionId", SessionParticipantController.getAllParticipants);

/**
 * @swagger
 * /session-participants/group-by-user:
 *   get:
 *     summary: Get all session participants grouped by user
 *     tags: [SessionParticipants]
 *     responses:
 *       200:
 *         description: Session participants grouped by user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/SessionParticipant'
 *       500:
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.get(
  "/group-by-user",
  SessionParticipantController.getAllSessionParticipantsGroupedByUser
);

module.exports = router;
