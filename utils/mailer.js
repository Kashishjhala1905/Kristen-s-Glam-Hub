const nodemailer = require("nodemailer");

exports.sendOTP = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 👈 APP PASSWORD
    },
  });

  await transporter.sendMail({
    from: `"Kristen's Glam Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Email Verification OTP",
    html: `
      <h2>Your OTP for email verification at Kristen's Glam Hub</h2>
      <p style="font-size:18px;"><b>${otp}</b></p>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });
};
