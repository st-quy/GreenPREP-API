const {
  OPTION_REGEX,
  LEADING_NUMBER_REGEX,
  QUESTION_TEXT_REGEX,
  OPTION_PREFIX_REGEX,
} = require("../common/Regex");

const { splitAndTrimLines } = require("../common/StringUtils");

const formatQuestionContent = (questionContent) => {
  const lines = splitAndTrimLines(questionContent);

  let firstOptions = null;
  let allOptionsSame = true;
  const leftItems = [];
  const rightItems = [];

  lines.forEach((line) => {
    const [left, right] = line.split("|").map((part) => part.trim());

    if (left) leftItems.push(left);

    if (right) {
      const options = right
        .split("/")
        .map((option) => option.split(".")[1]?.trim());

      if (firstOptions === null) {
        firstOptions = options;
      } else if (JSON.stringify(firstOptions) !== JSON.stringify(options)) {
        allOptionsSame = false;
      }
    }
  });

  if (allOptionsSame && firstOptions) {
    rightItems.push(firstOptions);
  }

  return { leftItems, rightItems };
};

const formatQuestionToJson = (
  question,
  questionContent,
  correctAnswer,
  partID,
  type
) => {
  return {
    title: question,
    audioKey: "",
    listContent: questionContent
      .split("Options")
      .slice(1)
      .map((content, index) => {
        const lines = content.split("\n").filter((line) => line.trim() !== "");
        const questionText = lines[1].replace(QUESTION_TEXT_REGEX, "").trim();
        const options = lines
          .slice(2)
          .map((opt) => opt.replace(OPTION_PREFIX_REGEX, "").trim());

        const correctOption = correctAnswer.match(
          new RegExp(`Options ${index + 1}: (\\d+) \\| ([A-C])`)
        );
        const correctAnswerText = correctOption
          ? options[parseInt(correctOption[1]) - 1]
          : "";

        return {
          ID: index + 1,
          content: questionText,
          options: options,
          correctAnswer: correctAnswerText,
          type: type,
          partID: partID,
        };
      }),
  };
};

const formatTitleWithAudio = (title) => {
  return {
    title: title || "",
    audioKey: "",
  };
};

module.exports = {
  formatQuestionContent,
  formatQuestionToJson,
  formatTitleWithAudio,
};
