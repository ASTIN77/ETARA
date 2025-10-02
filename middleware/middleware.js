// middleware/middleware.js
"use strict";

const middleware = {};

// Allow through if authenticated; otherwise go to login
middleware.checkCurrentUser = (req, res, next) => {
  if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
};

// Guard for routes that require login; remember target
middleware.isLoggedIn = (req, res, next) => {
  if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
    return next();
  }
  try {
    if (req.session) req.session.returnTo = req.originalUrl || req.url;
  } catch (_) {}
  req.flash("error", "You need to be logged in to do that!");
  return res.redirect("/login");
};

// Logout (Passport 0.6+). Regenerate a fresh session so flash can persist, then redirect.
middleware.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    const message = "You are now logged out.";

    // If sessions are enabled, regenerate to drop old data but keep a valid session for flash
    if (req.session && typeof req.session.regenerate === "function") {
      return req.session.regenerate((regenErr) => {
        if (regenErr) return next(regenErr);
        req.flash("success", message);
        return res.redirect("/login");
      });
    }

    // Fallback: no session available—just redirect
    return res.redirect("/login");
  });
};

module.exports = middleware;
