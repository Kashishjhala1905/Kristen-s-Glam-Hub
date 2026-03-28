const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: String,
  mobile: String,
  pincode: String,
  address: String,
  city: String,
  state: String
});

module.exports = mongoose.model("Address", addressSchema);
