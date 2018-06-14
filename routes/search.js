const   express             =       require("express"),
        router              =       express.Router({mergeParams: true}),
        Fault               =       require("../models/fault"),
        Mprn                =       require("../models/mprn"),
        middleware          =       require("../middleware/middleware");
        

router.post("/", middleware.isLoggedIn, function(req,res){

    var ticket = req.body.ticketRef, mprn = req.body.mprnRef;
    var ticketQuery = {'jobRef': ticket}, mprnQuery = {'mprNo': mprn};
        
        if (ticket.length) { // If ticket input field is not empty/undefined
        
            Fault.findOne(ticketQuery, function(err, foundFault){
                
                if(err) {
                        req.flash("error", "Something went wrong. Please contact the System Administrator.");
                        res.redirect("/");
                } else {
                    if (!foundFault) {
                        req.flash("error", "SMSDM Ticket Reference Not Found!");
                        res.redirect("/");
                    } else {
                            res.redirect("/search/" + foundFault._id);
                        
                        }
                    }
                });
            
                } else {
                    if (mprn) {
                            Fault.find(mprnQuery, function(err, foundMprn){
                                if(err){
                                    req.flash("error", "Something went wrong. Please contact the System Administrator.");
                                    res.redirect("/");
                                } else {
                                if (!foundMprn.length){
                                    req.flash("error", "MPRN not found. Please provide a valid MPRN.");
                                    res.redirect("/");
                                    } else {
                                        res.render("results", {faults: foundMprn});
                                    }
                                }
                            });
                
                        } 
                    }
});

// SHOW FAULT TICKET ROUTE

router.get("/:id", middleware.isLoggedIn, function(req, res) {
    
        
        Fault.findById(req.params.id, function(err, foundFault) {
        if (err) {
            console.log(err);
        
        } else {

            var query = {'mprNo': foundFault.mprNo};
            
            Mprn.findOne(query, function(err, foundMprn){
                if (err) {
                req.flash("error", "Please neter a valid mprn!");
                res.redirect("back");
                } else {
                    res.render("show", {fault: foundFault, mprn: foundMprn} );
                    }
            });
            
        }
        
    });
    
});

module.exports = router;