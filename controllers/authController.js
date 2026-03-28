const User = require("../models/User");
const CartItem = require("../models/CartItem");
const bcrypt = require("bcryptjs");
const { sendOTP } = require("../utils/mailer");

/* ======================
   OTP GENERATOR
====================== */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

exports.showSignup = (req, res) => {
  res.render("signup", { error: null });
};

/* =========================
   HANDLE SIGNUP
========================= */
exports.handleSignup = async (req, res) => {
  try {
    const { name, email, contact, password } = req.body;

    const exists = await User.findOne({
      $or: [{ email }, { contact }],
    });

    if (exists) {
      return res.render("signup", {
        error: "Email or Contact already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      contact,
      password: hashedPassword,
      isEmailVerified: false,
    });

    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      contact: newUser.contact,
    };

    req.session.cart = [];

    // 🔐 SEND OTP AFTER SIGNUP
    return exports.sendEmailOTP(req, res);
  } catch (err) {
    console.log("SIGNUP ERROR:", err);
    return res.render("signup", { error: "Something went wrong!" });
  }
};

/* =========================
   SHOW LOGIN
========================= */
exports.showLogin = (req, res) => {
  res.render("login", { error: null });
};

/* =========================
   HANDLE LOGIN
========================= */
exports.handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password" });
    }

    // 🔐 Password correct → Send OTP
    const otp = generateOTP();

    req.session.loginOTP = otp;
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

    req.session.tempUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
    };
    const savedCart = await CartItem.find({
      userId: user._id,
    });

    req.session.cart = savedCart;

    await sendOTP(user.email, otp);

    return res.redirect("/verify-email");
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.render("login", { error: "Something went wrong" });
  }
};

/* =========================
   LOGOUT
========================= */
exports.logout = (req, res) => {
  req.session.user = null; // remove user
  req.flash("success_msg", "Successfully Logged Out!");

  res.redirect("/"); // DO NOT destroy session here
};

/* =========================
   SEND EMAIL OTP
========================= */
exports.sendEmailOTP = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const otp = generateOTP();

    req.session.emailOTP = otp;
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

    await sendOTP(req.session.user.email, otp);

    return res.render("verifyEmail", { error: null });
  } catch (err) {
    console.log("SEND OTP ERROR:", err);
    return res.redirect("/");
  }
};

/* =========================
   VERIFY EMAIL OTP
========================= */
exports.verifyEmailOTP = async (req, res) => {
  const { otp } = req.body;

  if (!req.session.emailOTP || Date.now() > req.session.otpExpiry) {
    return res.render("verifyEmail", {
      error: "OTP expired. Please try again.",
      success: false,
    });
  }

  if (parseInt(otp) !== req.session.emailOTP) {
    return res.render("verifyEmail", {
      error: "Invalid OTP",
      success: false,
    });
  }

  // ✅ Mark verified
  await User.findByIdAndUpdate(req.session.user._id, {
    isEmailVerified: true,
  });

  delete req.session.emailOTP;
  delete req.session.otpExpiry;

  // ✅ Show success popup
  return res.render("verifyEmail", {
    error: null,
    success: true,
  });
};

exports.sendLoginOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const otp = generateOTP();

    user.loginOTP = otp;
    user.otpExpiry = Date.now() + 60 * 1000; // 1 minute
    await user.save();

    await sendOTP(user.email, otp);

    // Save temp user for OTP step
    req.session.tempLoginUser = user._id;

    return res.json({ success: true });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res.json({ success: false, message: "OTP send failed" });
  }
};

// =======================
// STEP 2: VERIFY OTP
// =======================
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!req.session.tempLoginUser) {
      return res.json({ success: false, message: "Session expired" });
    }

    const user = await User.findById(req.session.tempLoginUser);

    if (!user || !user.loginOTP) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (parseInt(otp) !== user.loginOTP) {
      return res.json({ success: false, message: "Wrong OTP" });
    }

    // ✅ OTP VERIFIED → FINAL LOGIN
    user.loginOTP = null;
    user.otpExpiry = null;
    await user.save();

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
    };

    delete req.session.tempLoginUser;
    req.flash("success_msg", "Successfully Logged in!");

    return res.json({ success: true });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.json({ success: false, message: "Verification failed" });
  }
};

exports.sendSignupOTP = async (req, res) => {
  try {
    const { name, email, contact, password } = req.body;

    // Check duplicates
    const exists = await User.findOne({
      $or: [{ email }, { contact }],
    });

    if (exists) {
      return res.render("signup", {
        error: "Email or Contact already exists!",
      });
    }

    const otp = generateOTP();

    // 🔐 Store temp signup data in session
    req.session.signupData = {
      name,
      email,
      contact,
      password,
    };

    req.session.signupOTP = otp;
    req.session.signupOtpExpiry = Date.now() + 60 * 1000; // 1 minute

    await sendOTP(email, otp);

    return res.render("verifySignupOTP", { error: null });
  } catch (err) {
    console.log("SIGNUP OTP ERROR:", err);
    res.redirect("/signup");
  }
};

/* =========================
   VERIFY SIGNUP OTP
========================= */
exports.verifySignupOTP = async (req, res) => {
  const { otp } = req.body;

  if (!req.session.signupOTP || Date.now() > req.session.signupOtpExpiry) {
    return res.render("verifySignupOTP", {
      error: "OTP expired. Please resend OTP.",
    });
  }

  if (parseInt(otp) !== req.session.signupOTP) {
    return res.render("verifySignupOTP", {
      error: "Invalid OTP",
    });
  }

  // ✅ OTP VERIFIED — CREATE USER
  const { name, email, contact, password } = req.session.signupData;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    contact,
    password: hashedPassword,
    isEmailVerified: true,
  });

  // Cleanup session
  delete req.session.signupOTP;
  delete req.session.signupOtpExpiry;
  delete req.session.signupData;

  // Login user
  req.session.user = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    contact: newUser.contact,
  };

  req.flash("success_msg", "Account created and Email verified successfully!");

  return res.redirect("/");
};

/* =========================
   RESEND SIGNUP OTP
========================= */
exports.resendSignupOTP = async (req, res) => {
  if (!req.session.signupData) {
    return res.redirect("/signup");
  }

  const otp = generateOTP();
  req.session.signupOTP = otp;
  req.session.signupOtpExpiry = Date.now() + 60 * 1000;

  await sendOTP(req.session.signupData.email, otp);

  return res.render("verifySignupOTP", {
    error: "New OTP sent to your email",
  });
};

/* =========================
   VERIFY EMAIL PAGE
========================= */
exports.verifyEmail = (req, res) => {
  res.render("verifyEmail", { error: null });
};
