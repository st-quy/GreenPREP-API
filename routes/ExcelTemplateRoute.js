const express = require("express");
const {
  handleExportTemplate,
} = require("../controller/ExcelTemplateController");

const router = express.Router();

/**
 * @swagger
 * /export-template:
 *   get:
 *     summary: "Export Test Template"
 *     description: "Exports a test template in Excel format."
 *     responses:
 *       200:
 *         description: "Template exported successfully"
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: "Error exporting template"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Error message"
 */
router.get("/export-template", handleExportTemplate);

module.exports = router;
