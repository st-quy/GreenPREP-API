function generateWritingSection(result, sessionParticipant) {
  const writingParts = result.writing || {};
  let html = "";

  Object.values(writingParts).forEach((part, index) => {
    html += `
      <div class="assessment-section">
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
