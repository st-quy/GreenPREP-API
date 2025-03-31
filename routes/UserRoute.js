// routers/UserRouter.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { allowAnonymous, authorize } = require("../middleware/AuthMiddleware");
const { registerUser, loginUser } = require("../controller/UserController");
const storage = multer.memoryStorage();
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - lastName
 *         - firstName
 *         - email
 *         - password
 *       properties:
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         phone:
 *           type: string
 *           description: The user's phone number (optional)
 *         studentCode:
 *           type: string
 *           description: The student's code (optional)
 *         teacherCode:
 *           type: string
 *           description: The teacher's code (optional)
 *         roleIDs:
 *           type: array
 *           items:
 *             type: string
 *           description: The roles assigned to the user
 *         class:
 *           type: string
 *           description: The user's class (optional)
 *       example:
 *         lastName: Doe
 *         firstName: John
 *         email: john.doe@example.com
 *         password: password123
 *         phone: 1234567890
 *         studentCode: SC12345
 *         teacherCode: TC67890
 *         roleIDs: ["student"]
 *         class: Class A
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     studentCode:
 *                       type: string
 *                     teacherCode:
 *                       type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/register", allowAnonymous, registerUser);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", allowAnonymous, loginUser);

module.exports = router;
