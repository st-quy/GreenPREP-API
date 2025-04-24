const {
  generateExcelTemplate,
} = require("../utils/excel/GenerateExcelTemplate");

const generateExcelTemplate = async () => {
  const filePath = await generateExcelTemplate();
  return filePath;
};

module.exports = { generateExcelTemplate };
