// routers/UserRouter.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { allowAnonymous, authorize } = require("../middleware/AuthMiddleware");
const {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  changePassword,
  forgotPassword,
  logoutUser,
  resetPassword,
} = require("../controller/UserController");
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

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:userId", authorize, getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:userId", authorize, updateUser);

/**
 * @swagger
 * /users/{userId}/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password
 */
router.post("/:userId/change-password", authorize, changePassword);

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     description: Sends a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Password reset link sent to your email"
 *       400:
 *         description: Invalid request or email not found
 *       500:
 *         description: Internal server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /users//reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     description: Allows users to reset their password using a valid token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1..."
 *               newPassword:
 *                 type: string
 *                 example: "NewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Password has been updated successfully"
 *       400:
 *         description: Invalid token or password format
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /users/logout/{userId}:
 *   post:
 *     summary: Logout user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       400:
 *         description: Error occurred
 */
router.post("/logout/:userId", authorize, logoutUser);

module.exports = router;
