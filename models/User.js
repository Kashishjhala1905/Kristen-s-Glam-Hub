const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  contact: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  photo: {
    type: String
  },

  loginOTP: Number,

  otpExpiry: Date,

  // Forgot Password
  resetPasswordToken: String,

  resetPasswordExpiry: Date

}, { timestamps: true });

const User = mongoose.model("User", userSchema);


module.exports = User;

module.exports = User;

