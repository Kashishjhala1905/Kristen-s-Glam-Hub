module.exports = function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  // remember where to return after login
  req.session.redirectTo = req.originalUrl;
  return res.redirect('/login');
};
