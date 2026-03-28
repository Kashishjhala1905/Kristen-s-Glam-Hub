// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
        {
            name: String,
            price: String,
            image: String,
            qty: { type: Number, default: 1 }
        }
    ],

    total: Number,
    status: { type: String, default: "Placed" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
