var middlewareObj = {};
var User = require("../models/user");


middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    return res.redirect("/login");
};

middlewareObj.logout = function (req, res, next) {
        req.logout();
        req.flash("success", "Your have successfully signed out.");
        res.redirect("/search");
    };
    
middlewareObj.isAdmin = function (req, res, next) {
       if(req.body.adminCode === 'C25hF931b#'){
           req.body.isOwner = true;
           req.body.isAdmin = true;
       }
       if (req.body.adminCode === '67b97CAd8#') {
           req.body.isAdmin = true;
       }
       return next();
    };


module.exports = middlewareObj;