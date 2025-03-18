const express = require("express");
const router = express.Router();
const { getTopicWithRelations } = require("../controller/TopicController");

router.get("/:id", getTopicWithRelations);

module.exports = router;
