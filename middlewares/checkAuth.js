// middleware/checkAuth.js

exports.checkAuthOnSubmit = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  // If not authenticated, redirect to login page with next param
  const nextUrl = req.originalUrl || '/booknow';
  return res.redirect(`/login?next=${encodeURIComponent(nextUrl)}&msg=login_required`);
};