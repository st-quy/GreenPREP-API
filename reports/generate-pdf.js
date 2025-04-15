const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

function formatDate(dateObj) {
  const date = new Date(dateObj);
  return date.toLocaleDateString("vi-VN");
}

exports.generatePDF = async (
  student,
  className,
  session,
  sessionParticipant,
  result
) => {
  const htmlPath = path.join(__dirname, "templates", "student-assessment.html");
  const logoPath = path.join(__dirname, "assets", "logo.png");
  const logogreenPrepPath = path.join(__dirname, "assets", "greenPrep.png");

  let html = fs.readFileSync(htmlPath, "utf-8");
  const logo = fs.readFileSync(logoPath);
  const logogreenPrep = fs.readFileSync(logogreenPrepPath);

  const logoBase64 = `data:image/png;base64,${logo.toString("base64")}`;
  const logogreenPrepBase64 = `data:image/png;base64,${logogreenPrep.toString(
    "base64"
  )}`;

  html = html.replace('src="logo.png"', `src="${logoBase64}"`);
  html = html.replace('src="greenPrep.png"', `src="${logogreenPrepBase64}"`);
  html = html.replace(/{{studentId}}/g, student.ID);
  html = html.replace(/{{studentEmail}}/g, student.email);
  html = html.replace(/{{studentFirstName}}/g, student.firstName);
  html = html.replace(/{{studentLastName}}/g, student.lastName);
  html = html.replace(/{{phone}}/g, student.phone);
  html = html.replace(/{{studentName}}/g, student.lastName);
  html = html.replace(/{{className}}/g, className.className);
  html = html.replace(/{{status}}/g, session.status);
  html = html.replace(/{{startDate}}/g, formatDate(session.startTime));
  html = html.replace(/{{endDate}}/g, formatDate(session.endTime));
  html = html.replace(/{{sessionName}}/g, session.sessionName);
  html = html.replace(/{{sessionKey}}/g, session.sessionKey);
  html = html.replace(/{{Grammar&Vocab}}/g, sessionParticipant.GrammarVocab);
  html = html.replace(
    /{{Grammar&VocabLevel}}/g,
    sessionParticipant.GrammarVocabLevel
  );
  html = html.replace(/{{Reading}}/g, sessionParticipant.Reading);
  html = html.replace(/{{ReadingLevel}}/g, sessionParticipant.ReadingLevel);
  html = html.replace(/{{Listening}}/g, sessionParticipant.Listening);
  html = html.replace(/{{ListeningLevel}}/g, sessionParticipant.ListeningLevel);
  html = html.replace(/{{Writing}}/g, sessionParticipant.Writing);
  html = html.replace(/{{WritingLevel}}/g, sessionParticipant.WritingLevel);
  html = html.replace(/{{Speaking}}/g, sessionParticipant.Speaking);
  html = html.replace(/{{SpeakingLevel}}/g, sessionParticipant.SpeakingLevel);
  html = html.replace(/{{Total}}/g, sessionParticipant.Total);
  html = html.replace(/{{Level}}/g, sessionParticipant.Level);
  html = html.replace(/{{Date}}/g, formatDate(sessionParticipant.createdAt));

  function generateWritingSection(result) {
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

  function generateSpeakingSection(result) {
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
                <div>Good Job!</div>
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

  const writingHTML = generateWritingSection(result);
  const speakingHTML = generateSpeakingSection(result);

  html = html.replace("{{writingSection}}", writingHTML);
  html = html.replace("{{speakingSection}}", speakingHTML);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();
  return pdfBuffer;
};
