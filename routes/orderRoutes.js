const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_SECRET"
});

/* =========================
   LOGIN CHECK
========================= */
function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

/* =========================
   PLACE ORDER PAGE
========================= */
router.get("/place-order", isLoggedIn, async (req, res) => {
  const cart = await CartItem.find({ userId: req.session.user._id });

  const total = cart.reduce((sum, item) => {
    return sum + item.price * (item.qty || 1);
  }, 0);

  res.render("placeOrder", {
    cart,
    total,
    address: req.session.address || null,
    paymentMode: req.session.paymentMode || null
  });
});

/* =========================
   SAVE ADDRESS
========================= */
router.post("/order/address", isLoggedIn, (req, res) => {
  const { street, city, state, pincode } = req.body;

  req.session.address = {
    street,
    city,
    state,
    pincode
  };

  req.flash("success_msg", "Address saved successfully");
  res.redirect("/place-order");
});

/* =========================
   SAVE PAYMENT MODE
========================= */
router.post("/order/payment-mode", isLoggedIn, (req, res) => {
  const { paymentMode } = req.body;

  if (!paymentMode) {
    req.flash("error_msg", "Please select a payment method");
    return res.redirect("/place-order");
  }

  req.session.paymentMode = paymentMode;

  console.log("✅ PAYMENT MODE SAVED:", paymentMode);

  req.flash("success_msg", "Payment method saved");
  res.redirect("/place-order");
});

/* =========================
   PAYMENT PAGE
========================= */
router.get("/payment", isLoggedIn, async (req, res) => {
  if (!req.session.address || !req.session.paymentMode) {
    return res.redirect("/place-order");
  }

  const cart = await CartItem.find({ userId: req.session.user._id });

  const total = cart.reduce((sum, item) => {
    return sum + item.price * (item.qty || 1);
  }, 0);

  res.render("paynow", {
    user: req.session.user,
    cart,
    address: req.session.address,
    paymentMode: req.session.paymentMode,
    total
  });
});

/* =========================
   UPDATE QUANTITY
========================= */
router.post("/place-order/update", isLoggedIn, async (req, res) => {
  const { id, qty } = req.body;

  await CartItem.findByIdAndUpdate(id, {
    qty: Math.max(1, Number(qty))
  });

  res.redirect("/place-order");
});

/* =========================
   REMOVE ITEM
========================= */
router.post("/place-order/remove", isLoggedIn, async (req, res) => {
  const { id } = req.body;

  await CartItem.findByIdAndDelete(id);

  res.redirect("/place-order");
});

/* =========================
   START PLACE ORDER (RESET)
========================= */
router.get("/place-order/start", isLoggedIn, (req, res) => {
  // 🔄 Reset previous checkout data
  req.session.address = null;
  req.session.paymentMode = null;

  res.redirect("/place-order");
});


/* =========================
   CONFIRM ORDER
========================= */
router.post("/place-order/confirm", isLoggedIn, async (req, res) => {
  await CartItem.deleteMany({ userId: req.session.user._id });

  req.session.address = null;
  req.session.paymentMode = null;

  req.flash("success_msg", "Order placed successfully 💖");
  res.redirect("/");
});

//CREATE RAZORPAY ORDER
router.post("/create-order", isLoggedIn, async (req, res) => {
  try {

    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    console.error("❌ RAZORPAY ERROR:", err);
    res.status(500).json({ error: "Payment failed" });
  }
});

//VERIFY PAYMENT
router.post("/verify-payment", isLoggedIn, async (req, res) => {
  try {

    console.log("✅ Payment Success:", req.body);

    await CartItem.deleteMany({ userId: req.session.user._id });

    req.session.address = null;
    req.session.paymentMode = null;

    res.json({ success: true });

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;
