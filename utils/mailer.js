const nodemailer = require("nodemailer");

exports.sendOTP = async (to, otp) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!emailUser || !emailPass) {
    throw new Error("Email credentials are missing. Set EMAIL_USER and EMAIL_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
  });

  await transporter.sendMail({
    from: `"Kristen's Glam Hub" <${emailUser}>`,
    to,
    subject: "Email Verification OTP",
    html: `
      <h2>Your OTP for email verification at Kristen's Glam Hub</h2>
      <p style="font-size:18px;"><b>${otp}</b></p>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });
};
