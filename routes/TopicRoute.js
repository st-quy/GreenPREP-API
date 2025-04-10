const express = require("express");
const router = express.Router();
const { getTopicWithRelations, getTopicByName } = require("../controller/TopicController");

router.get("/detail", getTopicByName);
router.get("/:id", getTopicWithRelations);

module.exports = router;
