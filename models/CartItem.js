// models/CartItem.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: String,
  price: Number,        // IMPORTANT: number, not "₹499"
  image: String,
  qty: { type: Number, default: 1 }
});

module.exports = mongoose.model("CartItem", cartItemSchema);
