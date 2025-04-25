const {
  generateExcelTemplate,
} = require("../utils/excel/GenerateExcelTemplate");
const ExcelJS = require("exceljs");

const generateTemplateFile = async () => {
  const filePath = await generateExcelTemplate();
  return filePath;
};

const parseExcelBuffer = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  const result = [];

  sheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return; 
    const part = row.getCell(2).value;
    const skill = row.getCell(1).value;

    if (part && skill) {
      const cleanPart = isNaN(part) ? part.toString().trim() : `Part${part}`;
      const cleanSkill = skill.toString().trim();
      result.push({ part: cleanPart, skill: cleanSkill });
    }
  });

  const grouped = result.reduce((acc, { part, skill }) => {
    if (!acc[skill]) acc[skill] = { part: [] };
    acc[skill].part.push(part);
    return acc;
  }, {});

  const finalResult = {
    part: [], 
    skillName: [], 
  };

  Object.keys(grouped).forEach((skill) => {
    finalResult.skillName.push(skill);
    finalResult.part.push(...grouped[skill].part); 
  });

  finalResult.part = [...new Set(finalResult.part)]; 
  finalResult.skillName = [...new Set(finalResult.skillName)]; 

  

  return finalResult;
};

module.exports = { generateTemplateFile, parseExcelBuffer };
