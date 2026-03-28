const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const requireLogin = require("../middlewares/authMiddleware");

// PROFILE PAGE (Protected)
router.get("/profile", requireLogin, async (req, res) => {
    try {
        const userId = req.session.user._id;

        const appointments = await Appointment.find({ userId }).sort({ createdAt: -1 });

        res.render("profile", {
            user: req.session.user,
            appointments,
            success_msg: req.flash("success_msg"),
            error_msg: req.flash("error_msg")
        });

    } catch (err) {
        console.log(err);
        req.flash("error_msg", "Something went wrong loading profile.");
        res.redirect("/");
    }
});

module.exports = router;
