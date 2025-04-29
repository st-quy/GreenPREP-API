// Regex to extract option letter and text, e.g., "A) Option text"
const OPTION_REGEX = /^([A-Z])[.)]\s*(.+)$/i;
// Regex to match a leading number followed by a period and optional whitespace
const LEADING_NUMBER_REGEX = /^\d+\.\s*/;
// Regex to clean up leading number and colon in question text, e.g., "1: Question text"
const QUESTION_TEXT_REGEX = /^\d+: /;
// Regex to match options (A), (B), (C) at the start of each option, e.g., "A)", "B)", "C)"
const OPTION_PREFIX_REGEX = /^[A-C]\)/;

module.exports = {
  OPTION_REGEX,
  LEADING_NUMBER_REGEX,
  QUESTION_TEXT_REGEX,
  OPTION_PREFIX_REGEX,
};
