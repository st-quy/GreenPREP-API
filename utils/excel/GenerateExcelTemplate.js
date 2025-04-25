const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const {
  DataMultipleChoice,
  DataDropdownList,
  DataMatching,
  DataOrdering,
  DataListeningGroup,
  DataWriting,
  DataSpeaking,
} = require("./SampleData");

const generateExcelTemplate = async () => {
  const workbook = new ExcelJS.Workbook();

  const applyHeaderStyle = (row) => {
    row.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };
    });
  };

  const applyContentStyle = (sheet) => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      row.eachCell((cell) => {
        cell.alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: "left",
        };
      });
    });
  };

  const autoFitColumns = (sheet) => {
    sheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : "";
        const longestLine = val
          .split(/\r?\n/)
          .reduce((max, line) => Math.max(max, line.length), 0);
        maxLength = Math.max(maxLength, longestLine + 2);
      });
      column.width = maxLength;
    });
  };

  const setSelectiveColumnWidth = (sheet, width, excludeCols) => {
    sheet.columns.forEach((column, index) => {
      const colLetter = String.fromCharCode(65 + index);
      if (excludeCols.includes(colLetter)) {
        column.width = 28;
      } else {
        column.width = width;
      }
    });
  };
  const createAllQuestionsNoFormulaSheet = () => {
    const sheet = workbook.addWorksheet("All Questions");

    const headerAllQuestions = [
      "Skill",
      "Part (You can further edit the title.)",
      "Sub Part",
      "Question Type",
      "Sequence",
      "Audio link",
      "Image link",
      "Question",
      "Question Content",
      "Correct Answer",
      "Sub Question",
      "Group Question",
      "Title",
      "Sub Title",
    ];

    applyHeaderStyle(sheet.addRow(headerAllQuestions));

    const dropdowns = [
      {
        col: "A",
        values: [
          "Grammar & Vocabulary",
          "Writing",
          "Speaking",
          "Reading",
          "Listening",
        ],
      },
      {
        col: "B",
        values: [
          "Part 1: ...",
          "Part 2: ...",
          "Part 3: ...",
          "Part 4: ...",
          "Part 5: ...",
        ],
      },
      {
        col: "D",
        values: [
          "ordering",
          "multiple-choice",
          "dropdown-list",
          "matching",
          "listening-questions-group",
          "writing",
          "speaking",
        ],
      },
    ];

    for (let row = 2; row <= 2000; row++) {
      dropdowns.forEach(({ col, values }) => {
        const cell = sheet.getCell(`${col}${row}`);
        cell.value = "";
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${values.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Invalid Selection",
          error: `Please select a valid option for ${col}.`,
        };
      });
    }

    autoFitColumns(sheet);
    applyContentStyle(sheet);
    setSelectiveColumnWidth(sheet, 60, ["A", "B", "D", "E", "F", "G"]);
    return sheet;
  };
  createAllQuestionsNoFormulaSheet();
  const createAllQuestionsSheet = () => {
    const sheet = workbook.addWorksheet("Suggested questions");

    const headers = [
      "Skill",
      "Part (You can further edit the title.)",
      "Sub Part",
      "Question Type",
      "Sequence",
      "Audio link",
      "Image link",
      "Question",
      "Question Content",
      "Correct Answer",
      "Sub Question",
      "Group Question",
      "Title",
      "Sub Title",
    ];

    applyHeaderStyle(sheet.addRow(headers));

    const dropdowns = [
      {
        col: "B",
        values: [
          "Part 1: ...",
          "Part 2: ...",
          "Part 3: ...",
          "Part 4: ...",
          "Part 5: ...",
        ],
      },
      {
        col: "D",
        values: [
          "ordering",
          "multiple-choice",
          "dropdown-list",
          "matching",
          "listening-questions-group",
          "writing",
          "speaking",
        ],
      },
    ];
    const questionTypes = [
      "multiple-choice",
      "multiple-choice",
      "dropdown-list",
      "dropdown-list",
      "ordering",
      "matching",
      "listening-questions-group",
      "writing",
      "speaking",
    ];

    const audioLink = [
      "https://example.com/audio1.mp3",
      "https://example.com/audio2.mp3",
    ];

    let audioIndex = 0;
    let usedTypes = {};

    for (let row = 2; row <= 10; row++) {
      const questionType = questionTypes[row - 2];

      const dCell = `D${row}`;
      const fCell = `F${row}`;
      const gCell = `G${row}`;
      const hCell = `H${row}`;
      const iCell = `I${row}`;
      const jCell = `J${row}`;
      const kCell = `K${row}`;
      const lCell = `L${row}`;
      const mCell = `M${row}`;
      const nCell = `N${row}`;

      sheet.getCell(dCell).value = questionType;

      if (
        ["multiple-choice", "dropdown-list"].includes(questionType) &&
        !usedTypes[questionType]
      ) {
        sheet.getCell(fCell).value = audioLink[audioIndex++];
        usedTypes[questionType] = true;
      } else if (questionType === "listening-questions-group") {
        sheet.getCell(fCell).value = { formula: `DataTemplate!H8` };
      } else {
        sheet.getCell(fCell).value = "";
      }

      sheet.getCell(`A${row}`).value = {
        formula: `IF(${dCell}="speaking", "Speaking", 
    IF(${dCell}="writing", "Writing", 
    IF(${dCell}="dropdown-list", IF(${fCell}<>"", "Listening", "Grammar&vocabulary - Reading"), 
    IF(${dCell}="multiple-choice", IF(${fCell}<>"", "Listening", "Grammar&vocabulary - Reading"), 
    IF(${dCell}="ordering", " Grammar&vocabulary - Reading", 
    IF(${dCell}="matching", "Grammar&vocabulary - Reading", 
    IF(${dCell}="listening-questions-group", "Listening", "")))))))`,
      };

      sheet.getCell(gCell).value = {
        formula: `IF(${dCell}="speaking", IF(${fCell}<>"", "", DataTemplate!I10), "")`,
      };

      sheet.getCell(hCell).value = {
        formula:
          `IF(${dCell}="multiple-choice", IF(${fCell}<>"", DataTemplate!A3, DataTemplate!A2), ` +
          `IF(${dCell}="dropdown-list", IF(${fCell}<>"", DataTemplate!A5, DataTemplate!A4), ` +
          `IF(${dCell}="ordering", IF(${fCell}<>"", "", DataTemplate!A7), ` +
          `IF(${dCell}="matching", IF(${fCell}<>"", "", DataTemplate!A6), ` +
          `IF(${dCell}="writing", IF(${fCell}<>"", "", DataTemplate!A9), ` +
          `IF(${dCell}="speaking", IF(${fCell}<>"", "", DataTemplate!A10), ` +
          `IF(${dCell}="listening-questions-group", IF(${fCell}<>"", DataTemplate!A8, ""), "")))))))`,
      };

      sheet.getCell(iCell).value = {
        formula:
          `IF(${dCell}="multiple-choice", IF(${fCell}<>"", DataTemplate!F3, DataTemplate!F2), ` +
          `IF(${dCell}="dropdown-list", IF(${fCell}<>"", DataTemplate!F5, DataTemplate!F4), ` +
          `IF(${dCell}="ordering", IF(${fCell}<>"", "", DataTemplate!F7), ` +
          `IF(${dCell}="matching", IF(${fCell}<>"", "", DataTemplate!F6), ` +
          `IF(${dCell}="listening-questions-group", IF(${fCell}<>"", DataTemplate!F8, ""), "")))))`,
      };

      sheet.getCell(jCell).value = {
        formula:
          `IF(${dCell}="multiple-choice", IF(${fCell}<>"", DataTemplate!G3, DataTemplate!G2), ` +
          `IF(${dCell}="dropdown-list", IF(${fCell}<>"", DataTemplate!G5, DataTemplate!G4), ` +
          `IF(${dCell}="matching", IF(${fCell}<>"", "", DataTemplate!G6), ` +
          `IF(${dCell}="ordering", IF(${fCell}<>"", "", DataTemplate!G7), ` +
          `IF(${dCell}="listening-questions-group", IF(${fCell}<>"", DataTemplate!G8, ""), "")))))`,
      };

      sheet.getCell(kCell).value = {
        formula: `IF(${dCell}="writing", IF(${fCell}<>"", "", DataTemplate!B9), "")`,
      };

      sheet.getCell(lCell).value = {
        formula:
          `IF(${dCell}="multiple-choice", IF(${fCell}<>"", DataTemplate!C3, DataTemplate!C2), ` +
          `IF(${dCell}="dropdown-list", IF(${fCell}<>"", DataTemplate!C5, DataTemplate!C4), ` +
          `IF(${dCell}="ordering", IF(${fCell}<>"", "", DataTemplate!C7), ` +
          `IF(${dCell}="listening-questions-group", IF(${fCell}<>"", DataTemplate!C8, ""), ""))))`,
      };

      sheet.getCell(mCell).value = {
        formula: `IF(${dCell}="matching", IF(${fCell}<>"", "", DataTemplate!D6), "")`,
      };

      sheet.getCell(nCell).value = {
        formula: `IF(${dCell}="matching", IF(${fCell}<>"", "", DataTemplate!E6), "")`,
      };

      dropdowns.forEach(({ col, values }) => {
        const cell = sheet.getCell(`${col}${row}`);
        cell.value = cell.value || "";
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${values.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Invalid Selection",
          error: `Please select a valid option for ${col}.`,
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
      });
    }

    autoFitColumns(sheet);
    applyContentStyle(sheet);
    setSelectiveColumnWidth(sheet, 60, ["A", "B", "D", "E", "F", "G"]);
    return sheet;
  };

  const createDataSheet = (sheetName, headers, exampleRows) => {
    const sheet = workbook.addWorksheet(sheetName);
    applyHeaderStyle(sheet.addRow(headers));
    exampleRows.forEach((row) => sheet.addRow(row));
    applyContentStyle(sheet);
    autoFitColumns(sheet);

    return sheet;
  };

  createAllQuestionsSheet();

  createDataSheet(
    "DataTemplate",
    [
      "Question",
      "SubQuestion",
      "GroupQuestion",
      "Title",
      "Sub Title",
      "Question Content",
      "Correct Answer",
      "Audio Link",
      "Image Link",
    ],
    [
      DataMultipleChoice[0],
      DataMultipleChoice[1],
      DataDropdownList[0],
      DataDropdownList[1],
      DataMatching,
      DataOrdering,
      DataListeningGroup,
      DataWriting,
      DataSpeaking,
    ]
  );

  const exportDir = path.join(__dirname, "../../../exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filePath = path.join(exportDir, "test-template.xlsx");
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

module.exports = { generateExcelTemplate };
