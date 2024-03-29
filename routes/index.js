const   express             =       require("express"),
        passport            =       require('passport'),
        router              =       express.Router({mergeParams: true}),
        User                =       require("../models/user"),
        middleware          =       require("../middleware/middleware");
        
// *** ROUTES ***

// INDEX ROUTE
    
router.get("/",  middleware.checkCurrentUser, (req,res) => { // missing 
    res.render("index");
}) ;

// LOGIN USER - GET ROUTE

router.get ("/login", (req,res) => {
    res.render("index/login");
});

// LOGIN USER - POST ROUTE

router.post("/login", (req, res, next) => {
     passport.authenticate('local', function(err, user, info) {
            if (err) { 
                req.flash("error", "Oops, something went wrong. Please try again!");
                return next(err); 
            }
            if (!user) { 
                req.flash("error", "Invalid Username or Password.");
                return res.redirect("/login"); 
            }
            req.flash("success", "Welcome " + user.username);
            req.logIn(user, function(err) {
                if (err) { 
                    return next(err); 
                    
                }
            return res.redirect("/");
    });
  })(req, res, next);
});  

// LOGOUT USER - GET ROUTE

router.get('/logout', middleware.logout, (req, res) => { 
            res.redirect('/login');
        });

// REGISTER USER - GET ROUTE
// router.get("/register", middleware.isLoggedIn, (req,res) => { 
    router.get("/register", (req,res) => {
    res.render("index/register"); 
});

// REGISTER USER - POST ROUTE

// router.post("/register", middleware.isLoggedIn, (req,res) => { 
    router.post("/register", (req,res) => { 
    var newUser = new User({firstName: req.body.firstName, lastName: req.body.lastName, 
                            username: req.body.username, email: req.body.email, isAdmin: req.body.isAdmin, isManager: req.body.isManager});
    User.register(newUser, req.body.password, (err, user) => {
                if(err){
                    req.flash("error", err.message);
                    return res.redirect("/register");
                } else {
                    req.flash("success", user.username + " account has been successfully created!");
                    res.redirect("/"); 
                    }
    });
});

module.exports = router;