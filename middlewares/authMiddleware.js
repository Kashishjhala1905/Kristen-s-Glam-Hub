module.exports = function requireLogin(req, res, next) {
    if (!req.session.user) {
        req.flash("error_msg", "Please login first 💗");
        return res.redirect("/login");
    }
    next();
};