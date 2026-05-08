const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const requireLogin = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Multer for photo uploads
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "user-" + req.session.user._id + "-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// PROFILE PAGE (Protected)
router.get("/profile", requireLogin, async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId); // Get fresh user data
        const appointments = await Appointment.find({ userId }).sort({ createdAt: -1 });

        res.render("profile", {
            user,
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

// UPDATE PROFILE
router.post("/profile/update", requireLogin, upload.single("photo"), async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { name, email, contact } = req.body;
        
        let updateData = { name, email, contact };
        
        if (req.file) {
            updateData.photo = "/uploads/" + req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        
        // Update session user
        req.session.user = updatedUser;
        
        req.flash("success_msg", "Profile updated successfully!");
        res.redirect("/profile");
    } catch (err) {
        console.log(err);
        req.flash("error_msg", "Error updating profile.");
        res.redirect("/profile");
    }
});

module.exports = router;
