function generateWritingSection(result, sessionParticipant) {
  const writingParts = result.writing || {};
  let html = "";

  Object.values(writingParts).forEach((part, index) => {
    html += `
      <div class="assessment-section">
        ${
          index === 0
            ? `
          <div class="assessment-header">
            <h3>Writing Assessment Part</h3>
            <div class="total-score">
              <span>Total Score:</span>
              <span class="score-box">${
                sessionParticipant.Writing || "0"
              }</span>
            </div>
          </div>
          <div class="assessment-subtitle">Detailed breakdown in the writing assessment</div>
        `
            : ""
        }
        <div class="assessment-content">
          <h4 class="part-title">Part ${index + 1}</h4>
    `;

    part.questions.forEach((q, i) => {
      html += `
        <div class="question-container">
          <div class="question-header">Question ${i + 1}</div>
          <div class="question-content">
            <div class="answer-section">
              <div class="section-label">Answer</div>
              <div>${q.AnswerText || ""}</div>
            </div>
            <div class="comment-section">
              <div class="section-label">Comment</div>
              <div>${q.Comment}</div>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  return html;
}

function generateSpeakingSection(result, sessionParticipant) {
  const speakingParts = result.speaking || {};
  const totalScore = sessionParticipant.Speaking || 0;
  let html = "";

  html += `
    <div class="assessment-section">
      <div class="assessment-header">
        <h3>Speaking Assessment Part</h3>
        <div class="total-score">
          <span>Total Score:</span>
          <span class="score-box">${totalScore}</span>
        </div>
      </div>
      <div class="assessment-subtitle">Detailed breakdown in the writing assessment</div>
  `;

  Object.values(speakingParts).forEach((part, index) => {
    html += `
      <div class="assessment-content">
        <h4 class="part-title">Part ${index + 1}</h4>
    `;

    part.questions.forEach((q, i) => {
      html += `
        <div class="question-container">
          <div class="question-header">Question ${i + 1}</div>
          <div class="question-content">
             <div class="comment-section">
                <div class="section-label">Comment</div>
                <div>${q.Comment}</div>
              </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

module.exports = {
  generateWritingSection,
  generateSpeakingSection,
};
