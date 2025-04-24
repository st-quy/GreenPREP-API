const { generateExcelTemplate } = require("../services/GenerateExcelTemplate");

const generateExcelTemplate = async (req, res) => {
  try {
    const filePath = await generateExcelTemplate();
    res.download(filePath, "template.xlsx");
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to export test template", error: err.message });
  }
};

module.exports = { generateExcelTemplate };
