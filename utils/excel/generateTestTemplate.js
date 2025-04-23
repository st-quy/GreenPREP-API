const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const generateTestTemplate = async () => {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: All Questions
  const sheetAllQuestions = workbook.addWorksheet("All Questions");

  const allQuestionsHeaders = [
    "Skill",
    "Part",
    "Question",
    "Question Type",
    "Level",
    "Note",
  ];
  const headerRowAllQuestions = sheetAllQuestions.addRow(allQuestionsHeaders);

  headerRowAllQuestions.eachCell((cell) => {
    Object.assign(cell, {
      font: { bold: true },
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      },
    });
  });

  // Auto fit columns for "All Questions" sheet
  sheetAllQuestions.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length + 2);
    });
    column.width = maxLength;
  });

  // Sheet 2: DataMultipleChoice
  const sheetDataMultipleChoice = workbook.addWorksheet("DataMultipleChoice");
  const dataMCHeaders = [
    "Question",
    "SubQuestion",
    "GroupQuestion",
    "Question Content",
    "Correct Answer",
  ];
  const headerRow = sheetDataMultipleChoice.addRow(dataMCHeaders);

  headerRow.eachCell((cell) => {
    Object.assign(cell, {
      font: { bold: true },
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9D9D9" },
      },
    });
  });

  // Dữ liệu mẫu
  const exampleRows = [
    [
      "Ex: I wish I ____ a better grade on the final exam last semester.",
      "",
      "",
      "(A). got,\n(B). would get,\n(C). had gotten",
      "(C). had gotten",
    ],
    [
      "Ex: A professor is talking to his student. What does the professor ask his student to do?",
      "",
      "Ex: A professor is talking to his student. What does the professor ask his student to do?",
      "(A). Speak at a conference.\n(B). Write another thesis.\n(C). Tutor another student.",
      "(A). Speak at a conference",
    ],
  ];

  exampleRows.forEach((row) => sheetDataMultipleChoice.addRow(row));

  // Auto fit cột cho sheet DataMultipleChoice
  sheetDataMultipleChoice.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length + 2);
    });
    column.width = maxLength;
  });

  // Dropdown cho "All Questions"
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

  for (let row = 2; row <= 100; row++) {
    dropdowns.map(({ col, values }) => {
      sheetAllQuestions.getCell(`${col}${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${values.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Invalid Selection",
        error: `Please select a valid option for ${col}.`,
      };
    });
  }

  const sheetDataDropdownList = workbook.addWorksheet("DataDropdownList");
  const dataDropdownListHeaders = [
    "Question",
    "SubQuestion",
    "GroupQuestion",
    "Question Content",
    "Correct Answer",
  ];

  const headerRowDataDropdownList = sheetDataDropdownList.addRow(
    dataDropdownListHeaders
  );

  headerRowDataDropdownList.eachCell((cell) => {
    Object.assign(cell, {
      font: { bold: true },
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      },
    });
  });

  const dropdownDataRows = [
    [
      `Dear Karen,
This contract has fifty pages. It is very 1. (hot/ long/ cold)
I ask my staff to read and check 2. (detail/ hour/ money)
I will print and give my staff a 3. (hand/ listen/ copy)
I know they are 4. (busy/ long/ hire) and not have free time
However, I need to finish this meeting with my 5. (boss/ client/ host)`,
      "",
      `(1). This contract has fifty pages. It is very | (A). hot / (B). long / (C). cold.
(2). I ask my staff to read and check | (A). detail / (B). hour / (C). money.
(3). I will print and give my staff a | (A). hand / (B). listen / (C). copy.
(4). I know they are | (A). busy / (B). long / (C). hire.
(5). However, I need to finish this meeting with my | (A). boss / (B). client / (C). host.`,
      "",
      `(1) | (B). long.
(2) | (A). detail.
(3) | (C). copy.
(4) | (A). busy.
(5) | (B). client.`,
    ],
    [
      `Ex: Four people are talking about travelling to work. Complete the sentences below.`,
      "",
      `Ex: Four people are talking about travelling to work. Complete the sentences below.`,
      `(1). Speaker A mainly _____ | D. travels by bus
(2). Speaker B usually _____ | A. travels by car
(3). Speaker C usually _____ | B. walks alone
(4). Speaker D primarily _____ | E. walks with a friend`,
      `(1). Speaker A mainly _____ | D. travels by bus
(2). Speaker B usually _____ | A. travels by car
(3). Speaker C usually _____ | B. walks alone
(4). Speaker D primarily _____ | E. walks with a friend`,
    ],
  ];

  dropdownDataRows.forEach((row) => {
    sheetDataDropdownList.addRow(row);
  });

  sheetDataDropdownList.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      const longestLineLength = val.split(/\r\n|\n|\r/).reduce((max, line) => {
        return Math.max(max, line.length);
      }, 0);

      maxLength = Math.max(maxLength, longestLineLength + 2);
    });

    column.width = maxLength;
  });

  const sheetDataMatching = workbook.addWorksheet("DataMatching");
  const dataMatchingHeaders = [
    "Question",
    "SubQuestion",
    "GroupQuestion",
    "Title",
    "Sub Title",
    "Question Content",
    "Correct Answer",
  ];
  const headerRowDataMatching = sheetDataMatching.addRow(dataMatchingHeaders);

  headerRowDataMatching.eachCell((cell) => {
    Object.assign(cell, {
      font: { bold: true },
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      },
    });
  });

  const matchingDataRows = [
    "Ex: Match the words with their synonyms.",
    "",
    "",
    "Ex: Select a word from the list that has the most similar meaning to the following words.",
    "Ex: big - large",
    `Base Word:
(1). complain.
(2). copy.
(3). disagree.

Matching Word:
(A). slice.
(B). ask.
(C). praise.
(D). duplicate.
(E). hoard.
(F). approve.
(G). conquer.
(H). argue.
(I). object.
(J). follow.`,
    `(1). complain | (I). object
(2). copy | (D). duplicate
(3). disagree | (H). argue`,
  ];
  const addeRowSheetDataMatching = sheetDataMatching.addRow(matchingDataRows);
  addeRowSheetDataMatching.eachCell((cell) => {
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });
  sheetDataMatching.columns.forEach((column) => {
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
  // Xuất file
  const exportDir = path.join(__dirname, "../../../exports");
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

  const filePath = path.join(exportDir, "test-template.xlsx");
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

module.exports = { generateTestTemplate };
