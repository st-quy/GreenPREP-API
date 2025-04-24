const {
  generateTemplateFile,
} = require("../services/GenerateExcelTemplateService");

const handleExportTemplate = async (req, res) => {
  try {
    const filePath = await generateTemplateFile();
    res.download(filePath, "template.xlsx");
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to export test template", error: err.message });
  }
};

module.exports = { handleExportTemplate };
