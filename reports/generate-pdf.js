const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const {
  generateWritingSection,
  generateSpeakingSection,
} = require("./utils/helpers");

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
  try {
    const logoPath = path.join(__dirname, "assets", "logo.png");
    const logogreenPrepPath = path.join(__dirname, "assets", "greenPrep.png");

    const logo = fs.readFileSync(logoPath);
    const logogreenPrep = fs.readFileSync(logogreenPrepPath);

    const logoBase64 = `data:image/png;base64,${logo.toString("base64")}`;
    const logogreenPrepBase64 = `data:image/png;base64,${logogreenPrep.toString(
      "base64"
    )}`;
    const template = require("./templates/student-assessment.js");
    const writingHTML = generateWritingSection(result, sessionParticipant);
    const speakingHTML = generateSpeakingSection(result, sessionParticipant);

    const data = {
      logo: logoBase64,
      greenPrep: logogreenPrepBase64,
      studentId: student.ID,
      studentEmail: student.email,
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      studentName: `${student.firstName} ${student.lastName}`,
      phone: student.phone,
      className: className.className,
      status: session.status,
      startDate: formatDate(session.startTime),
      endDate: formatDate(session.endTime),
      sessionName: session.sessionName,
      sessionKey: session.sessionKey,
      GrammarAndVocab: sessionParticipant.GrammarVocab,
      GrammarAndVocabLevel: sessionParticipant.GrammarVocabLevel,
      Reading: sessionParticipant.Reading,
      ReadingLevel: sessionParticipant.ReadingLevel,
      Listening: sessionParticipant.Listening,
      ListeningLevel: sessionParticipant.ListeningLevel,
      Writing: sessionParticipant.Writing,
      WritingLevel: sessionParticipant.WritingLevel,
      Speaking: sessionParticipant.Speaking,
      SpeakingLevel: sessionParticipant.SpeakingLevel,
      Total: sessionParticipant.Total,
      Level: sessionParticipant.Level,
      Date: formatDate(sessionParticipant.createdAt),
      writingSection: writingHTML,
      speakingSection: speakingHTML,
    };

    const finalHtml = template(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Lỗi khi tạo PDF:", error);
    throw error; 
  }
};
