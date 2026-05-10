const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

if (!emailUser || !emailPass) {
  console.log("❌ EMAIL CREDENTIALS MISSING");
}

// ✅ CREATE SINGLE TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

/* =========================
   SEND OTP MAIL
========================= */
const sendOTP = async (to, otp) => {

  await transporter.sendMail({
    from: `"Kristen's Glam Hub" <${emailUser}>`,
    to,

    subject: "Email Verification OTP",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        padding: 20px;
        background: #fff0f6;
        border-radius: 10px;
      ">

        <h2 style="color:#d63384;">
          Kristen's Glam Hub
        </h2>

        <p>
          Your OTP for email verification:
        </p>

        <div style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:5px;
          color:#333;
          margin:20px 0;
        ">
          ${otp}
        </div>

        <p>
          This OTP will expire in 5 minutes.
        </p>

      </div>
    `,
  });
};

/* =========================
   SEND RESET PASSWORD MAIL
========================= */
const sendResetPasswordMail = async (to, resetLink) => {

  await transporter.sendMail({
    from: `"Kristen's Glam Hub" <${emailUser}>`,
    to,

    subject: "Reset Your Password",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        padding: 20px;
        background: #fff0f6;
        border-radius: 10px;
      ">

        <h2 style="color:#d63384;">
          Password Reset Request
        </h2>

        <p>
          We received a request to reset your password.
        </p>

        <a
          href="${resetLink}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#d63384;
            color:white;
            text-decoration:none;
            border-radius:6px;
            margin-top:10px;
          "
        >
          Reset Password
        </a>

        <p style="margin-top:20px;">
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request this,
          please ignore this email.
        </p>

      </div>
    `,
  });
};

module.exports = {
  transporter,
  sendOTP,
  sendResetPasswordMail,

};
<<<<<<< HEAD
=======

>>>>>>> 2cf2691 (Added login functionality)
