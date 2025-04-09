const nodemailer = require("nodemailer");
const { User } = require("../models");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(
  userId,
  sessionName,
  testDetails,
  nextSteps,
  contactInfo
) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Test Submission Confirmation – ${sessionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #333;">Hello ${user.firstName} ${
        user.lastName
      },</h2>
          <p>We are pleased to confirm the successful submission of your test for the session: <strong>${sessionName}</strong>.</p>
          <h3>Test Details:</h3>
          <p>${testDetails}</p>
          ${nextSteps ? `<h3>Next Steps:</h3><p>${nextSteps}</p>` : ""}
          <h3>Contact Information:</h3>
          <p>${contactInfo}</p>
          <p>Thank you for your participation!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { status: 200, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = {
  sendEmail,
};
