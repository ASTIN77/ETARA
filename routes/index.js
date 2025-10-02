// routes/index.js

const express   = require("express");
const passport  = require("passport");
const router    = express.Router({ mergeParams: true });

const User       = require("../models/user");
const middleware = require("../middleware/middleware");

// Helper: pick a safe redirect target and clear it
function consumeReturnTo(req) {
  const rt = req.session?.returnTo;
  // Avoid redirecting back to auth pages
  const disallowed = new Set(["/login", "/register"]);
  const target = rt && !disallowed.has(rt) ? rt : "/";
  if (req.session) delete req.session.returnTo;
  return target;
}

// ------------------------------------------------------
// INDEX
// ------------------------------------------------------
router.get("/", middleware.checkCurrentUser, (req, res) => {
  return res.render("index");
});

// ------------------------------------------------------
// LOGIN - GET
// ------------------------------------------------------
router.get("/login", (req, res) => {
  return res.render("index/login");
});

// ------------------------------------------------------
// LOGIN - POST (uses returnTo when present)
// ------------------------------------------------------
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      req.flash("error", "Oops, something went wrong. Please try again!");
      return next(err);
    }
    if (!user) {
      req.flash("error", "Invalid Username or Password.");
      return res.redirect("/login");
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        req.flash("error", "Login failed. Please try again.");
        return next(loginErr);
      }
      req.flash("success", `Welcome ${user.username}`);
      const redirectTo = consumeReturnTo(req);
      return res.redirect(redirectTo);
    });
  })(req, res, next);
});

// ------------------------------------------------------
// LOGOUT - GET
// ------------------------------------------------------
router.get("/logout", middleware.logout);

// ------------------------------------------------------
// REGISTER - GET
// ------------------------------------------------------
router.get("/register", (req, res) => {
  return res.render("index/register");
});

// ------------------------------------------------------
// REGISTER - POST (auto-login + returnTo)
// ------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      isManager,
      password
    } = req.body;

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      isAdmin,
      isManager
    });

    const user = await User.register(newUser, password);

    req.login(user, (err) => {
      if (err) {
        req.flash("success", `${user.username} account created! Please log in.`);
        return res.redirect("/login");
      }
      req.flash("success", `${user.username} account has been successfully created!`);
      const redirectTo = consumeReturnTo(req);
      return res.redirect(redirectTo);
    });
  } catch (err) {
    req.flash("error", err.message || "Registration failed.");
    return res.redirect("/register");
  }
});

module.exports = router;
