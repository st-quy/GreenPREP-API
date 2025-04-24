const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const generateTestTemplate = async () => {
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

  const createAllQuestionsSheet = () => {
    const sheet = workbook.addWorksheet("All Questions");

    const headers = [
      "Skill",
      "Part",
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
        col: "A",
        values: [
          "Grammar & Vocabulary",
          "Writing",
          "Speaking",
          "Reading",
          "Listening",
        ],
      },
      { col: "B", values: ["Part 1", "Part 2", "Part 3", "Part 4", "Part 5"] },
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

      sheet.getCell(fCell).value = {
        formula: `IF(${dCell}="listening-questions-group", DataTemplate!H8, "")`,
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
    applyHeaderStyle(sheet.addRow(headers));
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
      [
        "Write your multiple-choice question here.",
        "",
        "",
        "",
        "",
        "(A). Option A\n(B). Option B\n(C). Option C",
        "(C)",
        "",
        "",
      ],
      [
        "Write your multiple-choice question here.",
        "",
        "Enter the group question title here.",
        "",
        "",
        "(A). Option A\n(B). Option B\n(C). Option C",
        "(A)",
        "",
        "",
      ],

      [
        "Enter your dropdown question content here. For example, an email or short passage with numbered blanks. (1), (2), etc.",
        "",
        "",
        "",
        "",
        "(1). write question here ... | A. Option A / B. Option B / C. Option C\n(2). write question here ... | A. Option A / B. Option B / C. Option C",
        "(1) | (B)\n(2) | (A)",
        "",
        "",
      ],
      [
        "Example: Four people are talking about their commute. Complete the sentences using dropdown options.",
        "",
        "Repeat the instruction or group question title here.",
        "",
        "",
        "(1). write question here ... | A. Option A / B. Option B / C. Option C\n(2). write question here ... | A. Option A / B. Option B / C. Option C",
        "(1). write question here ... | A\n(2). write question here ... | B",
        "",
        "",
      ],

      [
        "Example: Match the words with their meanings.",
        "",
        "",
        "Instruction: Choose the word that is closest in meaning.",
        "Example: big - large",
        "Contents :\n(1). Your word here.\n(2). Your word here.\n\nOptions :\n(A). Option A\n(B). Option B\n(C). Option C",
        "(1) | (C)\n(2) | (A)",
        "",
        "",
      ],

      [
        "Write sentences in mixed order that need to be rearranged.",
        "",
        "",
        "",
        "",
        "(A). Sentence one\n(B). Sentence two\n(C). Sentence three\n(D). Sentence four\n(E). Sentence five",
        "(A) | 3\n(B) | 1\n(C) | 5\n(D) | 2\n(E) | 4",
        "",
        "",
      ],

      [
        "Write a short instruction or context for the audio.",
        "",
        "Options 1: \nQuestion: Write question here ... \n (1) ...\n(2) ... \n(3) ... \n  \nOption 2:  \nQuestion: Write question here ... \n(1) ...\n(2) ... \n(3) ...",
        "",
        "",
        "Options 1: \nQuestion: Write question here ... \n(1) ...\n(2) ... \n(3) ... \n  \nOption 2:  \nQuestion: Write question here ... \n(1) ...\n(2) ... \n(3) ...",
        "Option 1: (1)\nOption 2: (2)",
        "https://your-audio-link-here.com/audio.mp3",
        "",
      ],

      [
        "Write the task prompt here. For example: Write an email to your friend about a topic.",
        "* (You may write up to 75 words without penalty.)",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],

      [
        "Write the speaking prompt here. For example: Tell me about your favorite movie.",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "may or may not be",
      ],
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

module.exports = { generateTestTemplate };
