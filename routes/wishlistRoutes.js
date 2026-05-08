const express = require("express");
const router = express.Router();
const WishlistItem = require("../models/WishlistItem");

// Middleware: user must be logged in
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

/* ======================
   VIEW WISHLIST
====================== */
router.get("/wishlist", isLoggedIn, async (req, res) => {
  const wishlist = await WishlistItem.find({
    userId: req.session.user._id
  });
  res.render("wishlist", { wishlist });
});

/* ======================
   ADD TO WISHLIST
====================== */
router.post("/wishlist/add", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required" });
  }

  const { name, price, image } = req.body;

  const numericPrice = Number(
    String(price).replace(/[^0-9.]/g, "")
  );

  let item = await WishlistItem.findOne({
    userId: req.session.user._id,
    name
  });

  if (!item) {
    await WishlistItem.create({
      userId: req.session.user._id,
      name,
      price: numericPrice,
      image
    });
  }

  res.json({ success: true });
});

/* ======================
   REMOVE FROM WISHLIST
====================== */
router.post("/wishlist/remove/:id", isLoggedIn, async (req, res) => {
  await WishlistItem.findByIdAndDelete(req.params.id);
  res.redirect("/wishlist");
});

module.exports = router;
