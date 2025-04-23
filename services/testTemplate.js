const { generateTestTemplate } = require("../utils/excel/generateTestTemplate");

const exportTestTemplateService = async () => {
  const filePath = await generateTestTemplate();
  return filePath;
};

module.exports = { exportTestTemplateService };
