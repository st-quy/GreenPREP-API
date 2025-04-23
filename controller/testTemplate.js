const { exportTestTemplateService } = require("../services/testTemplate");
const path = require("path");

const exportTestTemplateController = async (req, res) => {
  try {
    const filePath = await exportTestTemplateService();
    res.download(filePath, "test-template.xlsx"); // Tên gợi ý khi tải về
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to export test template", error: err.message });
  }
};

module.exports = { exportTestTemplateController };
