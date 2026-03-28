const express = require("express");
const router = express.Router();

const {
  showBookNow,
  submitBooking,
  booknow
} = require("../controllers/bookingController");

router.get("/booknow", showBookNow);
router.post("/booknow", submitBooking);
// router.get("/beautyproducts", booknow);

module.exports = router;
