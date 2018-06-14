const   express             =       require("express"),
        router              =       express.Router({mergeParams: true}),
        Fault               =       require("../models/fault"),
        Mprn                =       require("../models/mprn"),
        middleware          =       require("../middleware/middleware");
        
        
// CREATE NEW TICKET - GET ROUTE

router.get("/", middleware.isLoggedIn, function (req,res){
    res.render("new");
});

    
// CREATE TICKET WITH MPRN - POST ROUTE

router.post ("/mprn", middleware.isLoggedIn, function(req,res) {
    
    var query = {'mprNo': req.body.mprn};

    Mprn.findOne(query, function(err, foundMprn) {
        if(err){
                    req.flash("error", "Something went wrong. Please contact the System Administrator");
                    res.redirect("/tickets/");
                    
                } else {
                        if (!foundMprn) {
                            req.flash("error", "Please enter a valid mprn!");
                            res.redirect("/tickets/");
                        } else {
                                res.render("create", {mprn: foundMprn});
                        }
                }
            });
    });


// CREATE NEW TICKET - POST ROUTE

router.post("/new/create", middleware.isLoggedIn, function(req,res){
    
    //  The following line of code sanitizes the visit notes section 
    //  to remove any scripts that a user may inject
        req.body.faultNotes = req.sanitize(req.body.faultNotes);
        var mprn = req.body.mprn, faultCat = req.body.faultCat, notes = req.body.faultNotes, meterRead = req.body.meterRead;
        var dmAuthor = {
                        id: req.user._id,
                        username: req.user.username
                };
    
        var newFault = {mprNo: mprn, 
                    meterRead: meterRead, faultCat: faultCat, faultNotes: notes, dmAuthor: dmAuthor};

    // Create New Fault Ticket
    
        Fault.create(newFault, function(err, fault){
            if(err){
            req.flash("error", err.message);
            res.render("index");
            } else {
                
                req.flash("success", "Fault Ticket: " + fault.jobRef + " successfully created.");
                res.redirect("/");
            }
        });
    });
    
 
 // EDIT TICKET - POST ROUTE
 
 router.put("/:id", middleware.isLoggedIn, function(req,res){

        //  The following line of code sanitizes the visit notes section 
        //  to remove any scripts that a user may inject
        
        req.body.faultNotesUpdated = req.sanitize(req.body.faultNotesUpdated);
        var updatedNotes = req.body.fault.faultNotes + '&#10' +req.body.fault.faultNotesUpdated;

        // Creates the updated Fault Details
        var updatedData = { meterRead: req.body.fault.meterRead, faultCat: req.body.fault.faultCat, 
                            faultNotes: updatedNotes, 
                            dmAuthor: { id: req.user._id, username: req.user.username }
                            };
        // Find & update the correct Fault Ticket
        
        Fault.update({_id: req.params.id}, updatedData, function(err, updatedFault){

                if(err) {
                    req.flash("error", "An error has occured. No updated have been saved.");
                } else {
                    req.flash("success", "Fault " + updatedFault.jobRef + " has been successfully updated");
                    res.redirect("/search/" + req.params.id);
                }
    });
});   
    
module.exports = router;