// Regex to extract option letter and text, e.g., "A) Option text"
const OPTION_REGEX = /^([A-Z])[.)]\s*(.+)$/i;
// Regex to match a leading number followed by a period and optional whitespace
const LEADING_NUMBER_REGEX = /^\d+\.\s*/;
// Regex to clean up leading number and colon in question text, e.g., "1: Question text"
const QUESTION_TEXT_REGEX = /^\d+: /;

// Split each question block starting with a number + colon (e.g., "1:")
const QUESTION_BLOCK_SPLIT_REGEX = /\n(?=\d+\s*:\s)/;

// Match a question line like "1: What is...?"
const QUESTION_LINE_REGEX = /^\d+\s*:\s?.+$/gm;

// Regular expression to match the prefix of multiple-choice options,
// e.g., "A) ", ... , "Z) ", etc.
// ([A-Z]) captures a single uppercase letter at the start of the line.
// Followed by either ')' or '.', and optional whitespace.
const OPTION_PREFIX_REGEX = /^([A-Z])[).]\s*/;

// Regular expression to split the text into questions based on numbering,
// e.g., "1. ", "2: ", "10. ", etc.
// (?=...) is a positive lookahead that keeps the matched number in the result.
// \d+ matches one or more digits (question number).
// [.:] matches a dot or a colon following the number.
// 'g' flag ensures it finds all matches in the string.
const QUESTION_SPLIT_REGEX = /(?=\d+[.:])/g;

const CORRECT_ANSWER_REGEX = (index) =>
  new RegExp(`Option ${index}: (\\d+) \\| ([A-C])`);

module.exports = {
  OPTION_REGEX,
  LEADING_NUMBER_REGEX,
  QUESTION_TEXT_REGEX,
  OPTION_PREFIX_REGEX,
  QUESTION_BLOCK_SPLIT_REGEX,
  QUESTION_LINE_REGEX,
  QUESTION_SPLIT_REGEX,
  CORRECT_ANSWER_REGEX,
};
