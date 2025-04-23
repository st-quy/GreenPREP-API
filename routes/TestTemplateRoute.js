const express = require("express");
const { exportTestTemplateController } = require("../controller/testTemplate");

const router = express.Router();

router.get("/export-template", exportTestTemplateController);

module.exports = router;
