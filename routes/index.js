const express = require("express");
const db = require("../lib/db");
const bcrypt = require("bcrypt");
router = express.Router({ mergeParams: true });

// *** ROUTES ***

// INDEX ROUTE

router.get("/", (req, res) => {
  // missing
  res.render("index");
});

// LOGIN USER - GET ROUTE

router.get("/login", (req, res) => {
  res.render("index/login");
});

//authenticate user
router.post("/login", async (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    async (err, results, fields) => {
      if (err) {
        req.flash("error", "Please correct enter email and Password!");
        res.redirect("/login");
      } else {
        if (results.length > 0) {
          const comparision = await bcrypt.compare(
            password,
            results[0].password
          );
          if (comparision) {
            req.session.loggedin = true;
            req.session.username = req.flash("success", "Welcome " + username);
            res.redirect("/");
          } else {
            req.flash("error", "Email or Password is incorrect");
            res.redirect("/login");
          }
          // if user found
          // render to views/user/edit.ejs template file
        }
      }
    }
  );
});

// LOGOUT USER - GET ROUTE

router.get("/logout", (req, res) => {
  res.redirect("/login");
});

// REGISTER USER - GET ROUTE
// router.get("/register", middleware.isLoggedIn, (req,res) => {
router.get("/register", (req, res) => {
  res.render("index/register");
});

// REGISTER USER - POST ROUTE

// router.post("/register", middleware.isLoggedIn, (req,res) => {
router.post("/register", (req, res) => {
  const password = req.body.password;
  req.body.isAdmin ? (isAdmin = true) : (isAdmin = false);
  req.body.isManager ? (isManager = true) : (isManager = false);

  async function hashPassword(pass) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  }

  var newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: hashPassword(password),
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
