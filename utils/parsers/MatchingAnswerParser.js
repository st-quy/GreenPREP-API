const { splitAndTrimLines } = require("../common/StringUtils");

const parseMatchingAnswers = (correctStr, rightItems) =>
  splitAndTrimLines(correctStr)
    .map((line) => {
      const [leftNum, optionLetter] = line.split("|").map((s) => s.trim());
      if (!leftNum || !optionLetter) return null;

      const index = optionLetter.charCodeAt(0) - "A".charCodeAt(0);
      const right = rightItems[index] || "";

      return {
        left: leftNum,
        right,
      };
    })
    .filter(Boolean);

module.exports = { parseMatchingAnswers };
