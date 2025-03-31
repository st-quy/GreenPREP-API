const express = require("express");
const router = express.Router();

// Importing route modules
const userRoutes = require("./UserRoute");
const topicRoutes = require("./TopicRoute"); // Add this line
const ClassRoutes = require("./ClassRoute"); // Add this line
const SessionRoutes = require("./SessionRoute"); // Add this line

// Defining routes
router.use("/users", userRoutes);
router.use("/topics", topicRoutes); // Add this line
router.use("/classes", ClassRoutes); // Add this line
router.use("/sessions", SessionRoutes); // Add this line

router.use;

// Add more routes here as needed
// router.use("/another-route", anotherRoute);

module.exports = router;
