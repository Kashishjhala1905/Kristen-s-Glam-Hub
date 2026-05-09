const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Show contact page with flash message support
router.get("/contact", (req, res) => {
    res.render("contact", {
        success_msg: req.flash("success_msg") || "",
        error_msg: req.flash("error_msg") || ""
    });
});

// Handle feedback submission
router.post("/feedback", async (req, res) => {
    try {
        const { feedback } = req.body;
        const userEmail = req.session.user ? req.session.user.email : "Guest User";
        const emailUser = process.env.EMAIL_USER?.trim();
        const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

        if (!feedback || !feedback.trim()) {
            req.flash("error_msg", "Please write your feedback before sending.");
            return res.redirect("/contact");
        }

        if (!emailUser || !emailPass) {
            throw new Error("Email credentials are missing. Set EMAIL_USER and EMAIL_PASS.");
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        await transporter.sendMail({
            from: `"Kristen's Glam Hub Feedback" <${emailUser}>`,
            to: "kashishjhala05@gmail.com",
            subject: "New Feedback - Kristen's Glam Hub",
            text: `You have received new feedback from ${userEmail}:\n\n${feedback.trim()}`
        });

        req.flash("success_msg", "Thanks for your feedback 😊");
        res.redirect("/contact");
    } catch (err) {
        console.error("FEEDBACK EMAIL ERROR:", err);
        req.flash("error_msg", "Failed to send feedback.");
        res.redirect("/contact");
    }
});

module.exports = router;
