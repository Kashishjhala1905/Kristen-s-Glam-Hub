const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// MIDDLEWARE — Ensure user is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.flash("error_msg", "Please login first!");
    return res.redirect("/login");
  }
  next();
}

// ===============================
// GET BOOK NOW + EDIT MODE
// ===============================
router.get("/booknow", requireLogin, async (req, res) => {
  try {
    let appointment = null;

    // If edit mode — load appointment
    if (req.query.edit) {
      appointment = await Appointment.findOne({
        _id: req.query.edit,
        userId: req.session.user._id
      });
    }

    const smsg = req.flash("success_msg");
    const emsg = req.flash("error_msg");

    res.render("booknow", {
      user: req.session.user,
      appointment,
      success_msg: smsg.length ? smsg[0] : null,
      error_msg: emsg.length ? emsg[0] : null
    });

  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/profile");
  }
});

// ===============================
// POST CREATE OR UPDATE APPOINTMENT
// ===============================
router.post("/booknow", requireLogin, async (req, res) => {
  try {
    const { appt_id, name, contact, gender, date, time, city, state } = req.body;

    if (appt_id) {
      // -------- UPDATE EXISTING APPOINTMENT --------
      await Appointment.findOneAndUpdate(
        { _id: appt_id, userId: req.session.user._id },
        { name, contact, gender, date, time, city, state },
        { new: true }
      );

      req.flash("success_msg", "Changes made successfully!");
    } else {
      // -------- CREATE NEW APPOINTMENT --------
      await Appointment.create({
        userId: req.session.user._id,
        name,
        contact,
        gender,
        date,
        time,
        city,
        state
      });

      req.flash("success_msg", "Your appointment is booked successfully!");
    }

    res.redirect("/profile");

  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/booknow");
  }
});

// ===============================
// DELETE APPOINTMENT
// ===============================
router.get("/appointment/delete/:id", requireLogin, async (req, res) => {
  try {
    await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.user._id
    });

    req.flash("success_msg", "Appointment cancelled successfully!");
    res.redirect("/profile");

  } catch (err) {
    console.log(err);
    req.flash("error_msg", "Could not cancel appointment.");
    res.redirect("/profile");
  }
});

module.exports = router;
