const express = require("express");
const router = express.Router();

// Importing route modules
const userRoutes = require("./UserRoute");
const topicRoutes = require("./TopicRoute"); // Add this line

// Defining routes
router.use("/users", userRoutes);
router.use("/topics", topicRoutes); // Add this line

// Add more routes here as needed
// router.use("/another-route", anotherRoute);

module.exports = router;
