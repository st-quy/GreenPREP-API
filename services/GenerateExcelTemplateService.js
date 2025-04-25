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

  // Đọc từng dòng dữ liệu
  sheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return; // Bỏ qua header
    const part = row.getCell(1).value;
    const skill = row.getCell(2).value;

    if (part && skill) {
      // Xử lý nếu part là số, và skill là chuỗi
      const cleanPart = isNaN(part) ? part.toString().trim() : `Part${part}`;
      const cleanSkill = skill.toString().trim();
      result.push({ part: cleanPart, skill: cleanSkill });
    }
  });

  // Group by part và gom lại các skill tương ứng vào một mảng duy nhất
  const grouped = result.reduce((acc, { part, skill }) => {
    if (!acc[skill]) acc[skill] = { part: [] };
    acc[skill].part.push(part);
    return acc;
  }, {});

  // Tạo kết quả cuối cùng
  const finalResult = {
    success: true,
    data: {
      part: [], // mảng part trống
      skill: [], // mảng skill trống
    },
  };

  // Lấy tất cả 'skill' và 'part' từ grouped
  Object.keys(grouped).forEach((skill) => {
    finalResult.data.skill.push(skill); // Thêm skill vào mảng skill
    finalResult.data.part.push(...grouped[skill].part); // Thêm tất cả part vào mảng part
  });

  // Loại bỏ trùng lặp trong phần "part" và sắp xếp lại theo thứ tự nếu cần
  finalResult.data.part = [...new Set(finalResult.data.part)]; // Loại bỏ các giá trị trùng lặp trong mảng part
  finalResult.data.skill = [...new Set(finalResult.data.skill)]; // Loại bỏ các giá trị trùng lặp trong mảng skill

  return finalResult;
};

module.exports = { generateTemplateFile, parseExcelBuffer };
