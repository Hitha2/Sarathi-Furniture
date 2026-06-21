import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  try {
    console.log("📧 Sending email to:", to);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error; // important for catching in controller
  }
};

export default sendEmail;