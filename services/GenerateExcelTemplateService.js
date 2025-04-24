const {
  generateExcelTemplate,
} = require("../utils/excel/GenerateExcelTemplate");

const generateTemplateFile = async () => {
  const filePath = await generateExcelTemplate();
  return filePath;
};

module.exports = { generateTemplateFile };
