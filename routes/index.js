const express = require("express");
const db = require("../lib/db");
const bcrypt = require("bcrypt");
const middlewareObj = require("../middleware/middleware");
router = express.Router({ mergeParams: true });

// *** ROUTES ***

// INDEX ROUTE

router.get("/", (req, res) => {
  res.render("index");
});

// LOGIN USER - GET ROUTE

router.get("/login", (req, res) => {
  res.render("index/login");
});

//authenticate user
router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],

    (error, results, fields) => {
      if (error) {
        console.log(error.message);
        req.flash("error", "Please enter correct username and Password!");
        res.redirect("/login");
      }
      if (results.length > 0) {
        const comparison = bcrypt.compare(password, results[0].password);
        if (comparison) {
          req.session.loggedin = true;
          req.flash("success", "Welcome " + req.body.username);
          res.redirect("/");
        } else {
          req.flash("error", "Username or Password is incorrect");
          res.redirect("/login");
        }
      }
    }
  );
});

// LOGOUT USER - GET ROUTE

router.get("/logout", (req, res) => {
  req.session.loggedin = false;
  req.flash("Success", "You have successfully logged out. Goodbye!");
  res.redirect("/login");
});

// REGISTER USER - GET ROUTE
// router.get("/register", middleware.isLoggedIn, (req,res) => {
router.get("/register", (req, res) => {
  res.render("index/register");
});

// REGISTER USER - POST ROUTE

// router.post("/register", middleware.isLoggedIn, (req,res) => {
router.post("/register", async (req, res) => {
  const pass = req.body.password;
  req.body.isAdmin ? (isAdmin = true) : (isAdmin = false);
  req.body.isManager ? (isManager = true) : (isManager = false);

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(pass, saltRounds);

  var newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: hashedPassword,
    email: req.body.email,
    isAdmin: isAdmin,
    isManager: isManager,
  };

  db.query("INSERT INTO users SET ?", newUser, function (err, results, fields) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/register");
    } else {
      req.flash(
        "success",
        newUser.username + " account has been successfully created!"
      );
      res.redirect("/");
    }
  });
});

module.exports = router;
