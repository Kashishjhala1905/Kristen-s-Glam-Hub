const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const requireLogin = require("../middlewares/authMiddleware");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files can be uploaded."));
        }
        cb(null, true);
    }
});

function sessionUser(user) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        photo: user.photo
    };
}

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

async function updateProfile(req, res) {
    try {
        const userId = req.session.user._id;
        const { name, email, contact } = req.body;
        
        let updateData = { name, email, contact };
        
        if (req.file) {
            updateData.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        });
        
        // Update session user
        req.session.user = sessionUser(updatedUser);
        
        req.flash("success_msg", "Profile updated successfully!");
        res.redirect("/profile");
    } catch (err) {
        console.log(err);
        const message = err.code === 11000
            ? "That email or contact number is already used by another account."
            : "Error updating profile.";
        req.flash("error_msg", message);
        res.redirect("/profile");
    }
}

// UPDATE PROFILE
router.post("/profile/update", requireLogin, (req, res, next) => {
    upload.single("photo")(req, res, (err) => {
        if (err) {
            console.log("PROFILE PHOTO UPLOAD ERROR:", err);
            const message = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
                ? "Profile photo must be smaller than 2MB."
                : err.message || "Error uploading profile photo.";
            req.flash("error_msg", message);
            return res.redirect("/profile");
        }

        updateProfile(req, res).catch(next);
    });
});

module.exports = router;
