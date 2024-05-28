var middlewareObj = {};

middlewareObj.checkCurrentUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that!");
  return res.redirect("/login");
};

middlewareObj.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are now logged out.");
    return next();
    //res.redirect('/');
  });
};

module.exports = middlewareObj;
