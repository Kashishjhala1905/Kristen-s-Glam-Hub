const express = require("express");
const router = express.Router();
const Address = require("../models/Address");

const isLoggedIn = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  next();
};

/* SHOW ADDRESS PAGE */
router.get("/address", isLoggedIn, async (req, res) => {
  const address = await Address.findOne({ userId: req.session.user._id });
  res.render("address", { address });
});

/* SAVE ADDRESS */
router.post("/address", isLoggedIn, async (req, res) => {
  const { name, mobile, pincode, address, city, state } = req.body;

  let saved = await Address.findOne({ userId: req.session.user._id });

  if (saved) {
    Object.assign(saved, { name, mobile, pincode, address, city, state });
    await saved.save();
  } else {
    await Address.create({
      userId: req.session.user._id,
      name,
      mobile,
      pincode,
      address,
      city,
      state
    });
  }

  res.redirect("/payment");
});


router.post("/address/save", async (req, res) => {
  const { fullname, street, city, pincode, phone } = req.body;

  await Address.findOneAndUpdate(
    { userId: req.session.user._id },
    {
      userId: req.session.user._id,
      fullname,
      street,
      city,
      pincode,
      phone
    },
    { upsert: true }
  );

  res.redirect("/place-order");
});

module.exports = router;
