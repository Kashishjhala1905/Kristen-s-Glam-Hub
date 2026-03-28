const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem");

// Middleware: user must be logged in
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

/* ======================
   VIEW CART
====================== */
router.get("/mycart", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const cart = await CartItem.find({
    userId: req.session.user._id
  });

  res.render("cart", { cart });
});


/* ======================
   ADD TO CART
====================== */
router.post("/cart/add", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required" });
  }

  const { name, price, image } = req.body;

  const numericPrice = Number(
    String(price).replace(/[^0-9.]/g, "")
  );

  let item = await CartItem.findOne({
    userId: req.session.user._id,
    name
  });

  if (item) {
    item.qty += 1;
    await item.save();
  } else {
    await CartItem.create({
      userId: req.session.user._id,
      name,
      price: numericPrice,
      image,
      qty: 1
    });
  }

  req.flash("success_msg" , "Item added in the cart!");

  res.json({ success: true });
});


/* ======================
   UPDATE QUANTITY (+ / −)
====================== */
router.post("/cart/update/:index", async (req, res) => {
  const { change } = req.body;
  const userId = req.session.user._id;

  const cart = await CartItem.find({ userId });

  if (!cart[req.params.index]) return res.sendStatus(400);

  cart[req.params.index].qty = Math.max(
    1,
    (cart[req.params.index].qty || 1) + change
  );

  await cart[req.params.index].save();
  res.sendStatus(200);
});

/* ======================
   REMOVE ITEM
====================== */
router.post("/cart/remove/:index", async (req, res) => {
  const userId = req.session.user._id;
  const cart = await CartItem.find({ userId });

  if (!cart[req.params.index]) return res.sendStatus(400);

  await CartItem.findByIdAndDelete(cart[req.params.index]._id);
  res.sendStatus(200);
});


module.exports = router;
