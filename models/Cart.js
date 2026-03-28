const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  name: String,
  price: Number,   // ALWAYS NUMBER (₹ removed)
  image: String,
  qty: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },
  items: [cartItemSchema]
});

module.exports = mongoose.model("Cart", cartSchema);