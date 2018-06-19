const   express             =       require("express"),
        router              =       express.Router({mergeParams: true}),
        Fault               =       require("../models/fault"),
        Mprn                =       require("../models/mprn"),
        Comment                =       require("../models/comment"),
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
        req.body.comment.text = req.sanitize(req.body.comment.text);
        var mprn = req.body.mprn, faultCat = req.body.faultCat, meterRead = req.body.meterRead;
        var dmAuthor = {
                        id: req.user._id,
                        username: req.user.username
                };
    
        var newFault = {mprNo: mprn, 
                    meterRead: meterRead, faultCat: faultCat, dmAuthor: dmAuthor};
                    
    // Create New Fault Ticket
    
        Fault.create(newFault, function(err, newFault){
            if(err){
            req.flash("error", "Oops, Error Creating New Ticket. Please request assistance from your system administrator.");
            res.render("index");
            } else {
                
                // Create a new Comment
                // and add to the Fault Ticket
                
                Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("/");
                    console.log(err);
                } else {
                    comment.dmAuthor.id = req.user._id;
                    comment.dmAuthor.username = req.user.username;
                    //save comment
                    comment.save();
                    // Push comments to the newly created Fault & Save
                    newFault.comments.push(comment);
                    newFault.save(); // Save the fault with the fault note referenced
                    req.flash("success", "Fault Ticket SMSDM: " + newFault.jobRef + " successfully created.");
                    res.redirect("/");
                   }

                });
                    }
            });
                
    
    
});

 // EDIT TICKET - POST ROUTE
 
 router.put("/:id", middleware.isLoggedIn, function(req,res){

        //  The following line of code sanitizes the visit notes section 
        //  to remove any scripts that a user may inject
        
        req.body.comment.text = req.sanitize(req.body.comment.text);

        // Creates the updated Fault Details
        var updatedData = { meterRead: req.body.fault.meterRead, faultCat: req.body.fault.faultCat, 
                            dmAuthor: { id: req.user._id, username: req.user.username }
                            };
        // Find & update the correct Fault Ticket
        
        Fault.findOneAndUpdate({_id: req.params.id}, updatedData, function(err, updatedFault){
                console.log(updatedFault);
                if(err) {
                    req.flash("error", "An error has occured. No updated have been saved.");
                } else {
                    
                    // Get latest comment and update
                     Comment.create(req.body.comment, function(err, comment){
                        if(err){
                            req.flash("error", err.message);
                            res.redirect("/");
                            console.log(err);
                            
                            } else {
                                comment.dmAuthor.id = req.user._id;
                                comment.dmAuthor.username = req.user.username;
                                //save comment
                                comment.save();
                                // Push comments to the newly created Fault & Save
                                updatedFault.comments.push(comment);
                                updatedFault.save(); // Save the fault with the fault note referenced
                                req.flash("success", "Fault SMSDM " + updatedFault.jobRef + " has been successfully updated");
                                res.redirect("/search/" + req.params.id);
                       }
                    }); 
                }
        });
});   
    
module.exports = router;