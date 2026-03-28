const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  name: String,
  contact: String,
  gender: String,
  time: String,
  city: String,
  state: String,
  date: {
    type: String,
    default: () => new Date().toLocaleDateString()
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
