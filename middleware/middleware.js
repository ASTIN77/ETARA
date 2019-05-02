var middlewareObj = {};


middlewareObj.checkCurrentUser = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect("/login");
};

middlewareObj.isLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    return res.redirect("/login");
};

middlewareObj.logout = (req, res, next) => {
        req.logout();
        req.flash("success", "You are now logged out.");
        return next();
    };
    
module.exports = middlewareObj;