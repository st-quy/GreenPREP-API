const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

function formatDate(dateObj, options = { withTime: false }) {
  const date = new Date(dateObj);
  const dateStr = date.toLocaleDateString("vi-VN");

  if (options.withTime) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours < 12 ? "sáng" : "chiều";
    const displayHour = hours > 12 ? hours - 12 : hours;

    return `${dateStr} lúc ${displayHour}:${minutes} ${period}`;
  }

  return dateStr;
}

exports.generatePDF = async (
  student,
  className,
  session,
  sessionParticipant
) => {
  // Đọc HTML và CSS
  const htmlPath = path.join(__dirname, "templates", "student-assessment.html");
  const cssPath = path.join(__dirname, "styles", "report-style.css");
  const logoPath = path.join(__dirname, "assets", "logoUniversity.png");

  let html = fs.readFileSync(htmlPath, "utf-8");
  const css = fs.readFileSync(cssPath, "utf-8");
  const logo = fs.readFileSync(logoPath);

  const logoBase64 = `data:image/png;base64,${logo.toString("base64")}`;

  html = html.replace("</head>", `<style>${css}</style></head>`);

  html = html.replace('src="logoUniversity.png"', `src="${logoBase64}"`);

  html = html.replace(/{{studentName}}/g, student.lastName);
  html = html.replace(/{{className}}/g, className.className);
  html = html.replace(/{{classKey}}/g, session.sessionKey);
  html = html.replace(/{{status}}/g, session.status);
  html = html.replace(/{{startDate}}/g, formatDate(session.startTime));
  html = html.replace(/{{endDate}}/g, formatDate(session.endTime));
  html = html.replace(/{{sessionName}}/g, session.sessionName);
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

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const outputPath = path.join(
    __dirname,
    `student-report-${student.lastName}.pdf`
  );
  await page.pdf({ path: outputPath, format: "A4" });

  await browser.close();
  return outputPath;
};
