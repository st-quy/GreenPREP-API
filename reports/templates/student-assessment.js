const Handlebars = require("handlebars");
const html = ` <!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Information</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        position: relative;
        height: 60px;
      }
      .logo {
        width: 200px;
        height: auto;
        position: absolute;
      }
      .logo-left {
        left: 0;
        top: 0;
      }
      .logo-right {
        right: 0;
        top: 0;
      }
      .student-name {
        text-align: center;
        margin: 20px 0;
      }
      .student-name h2 {
        margin: 5px 0;
      }
      .student-name p {
        margin: 5px 0;
        color: #666;
      }
      .info-section {
        border: 1px solid #ddd;
        margin-bottom: 20px;
        padding: 15px;
      }
      .info-section h3 {
        margin-top: 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .info-item {
        display: grid;
        grid-template-columns: 120px 1fr;
        padding: 5px 0;
      }
      .label {
        color: #666;
      }
      .score-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .assessment-section {
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-bottom: 20px;
        overflow: hidden;
      }
      .assessment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background-color: #f8f8f8;
      }
      .assessment-header h3 {
        font-weight: bold;
        font-size: 18px;
        margin: 0;
      }
      .total-score {
        display: flex;
        align-items: center;
      }
      .score-box {
        border: 1px solid #ddd;
        padding: 5px 15px;
        border-radius: 3px;
        margin-left: 10px;
      }
      .assessment-subtitle {
        padding: 10px 15px;
        background-color: #f0f0f0;
        font-size: 14px;
        color: #666;
      }
      .assessment-content {
        padding: 15px;
      }
      .part-title {
        text-align: center;
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 15px;
      }
      .question-group {
        margin-bottom: 15px;
      }
      .question-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 15px;
      }
      .question-box,
      .comment-box {
        display: flex;
        flex-direction: column;
      }
      .question-header,
      .comment-header {
        background-color: #e0e0e0;
        padding: 8px;
        font-weight: 600;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
      }
      .question-content,
      .comment-content {
        border: 1px solid #ddd;
        padding: 10px;
        min-height: 80px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }
      .question-content.empty {
        min-height: 80px;
      }
      .comment-content {
        min-height: 80px;
      }

      .section-label {
        color: #000;
        font-weight: bold;
        display: block;
        margin-bottom: 5px;
      }

      .answer-section {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }

      .answer-section {
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 4px;
      }

      .comment-section {
        background-color: #f0f7ff;
        padding: 10px;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img
        src="{{greenPrep}}"
        alt="University of Greenwich Logo"
        class="logo logo-right"
      />
      <img src="{{logo}}" alt="GreenPREP Logo" class="logo logo-left" />
    </div>

    <div class="student-name">
      <h2>{{studentName}}</h2>
      <p>STUDENT</p>
    </div>

    <div class="info-section">
      <h3>Student Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Student ID:</span>
          <span>{{studentId}}</span>
        </div>
        <div class="info-item">
          <span class="label">Email:</span>
          <span>{{studentEmail}}</span>
        </div>
        <div class="info-item">
          <span class="label">Phone:</span>
          <span>{{phone}}</span>
        </div>
        <div class="info-item">
          <span class="label">Class:</span>
          <span>{{className}}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>Session Details</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Session name:</span>
          <span>{{sessionName}}</span>
        </div>
        <div class="info-item">
          <span class="label">Start Date:</span>
          <span>{{startDate}}</span>
        </div>
        <div class="info-item">
          <span class="label">Session Key:</span>
          <span>{{sessionKey}}</span>
        </div>
        <div class="info-item">
          <span class="label">End Date:</span>
          <span>{{endDate}}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>All Score</h3>
      <div class="info-item">
        <span class="label">Band Level:</span>
        <span>{{Level}}</span>
      </div>
      <div class="score-grid">
        <div class="info-item">
          <span class="label">Grammar & Vocab:</span>
          <span>{{GrammarAndVocab}} | {{GrammarAndVocabLevel}} </span>
        </div>
        <div class="info-item">
          <span class="label">Listening:</span>
          <span>{{Listening}} | {{ListeningLevel}}</span>
        </div>
        <div class="info-item">
          <span class="label">Reading:</span>
          <span>{{Reading}} | {{ReadingLevel}}</span>
        </div>
        <div class="info-item">
          <span class="label">Speaking:</span>
          <span>{{Speaking}} | {{SpeakingLevel}}</span>
        </div>
        <div class="info-item">
          <span class="label">Writing:</span>
          <span>{{Writing}} | {{WritingLevel}}</span>
        </div>
        <div class="info-item">
          <span class="label">Total:</span>
          <span>{{Total}} | {{Level}}</span>
        </div>
      </div>
    </div>
    <div>{{{speakingSection}}}</div>
    <div>{{{writingSection}}}</div>
  </body>
</html>
`;
module.exports = Handlebars.compile(html);