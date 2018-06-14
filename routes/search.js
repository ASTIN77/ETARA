const   express             =       require("express"),
        router              =       express.Router({mergeParams: true}),
        Fault               =       require("../models/fault"),
        Mprn                =       require("../models/mprn"),
        middleware          =       require("../middleware/middleware");
        

router.post("/", middleware.isLoggedIn, function(req,res){

    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        var ticket = req.body.ticketRef, mprn = req.body.mprnRef;
        var ticketQuery = {'jobRef': ticket}, mprnQuery = {'mprNo': mprn};
        
        if (ticket.length) { // If ticket input field is not empty/undefined
        
            Fault.findOne(ticketQuery, function(err, foundFault){
                if (err) {
                    req.flash("error", "SMSDM Ticket Reference Not Found!");
                    res.redirect("index");
                } else {
                        res.redirect("/search/" + foundFault._id);
                    
                    }
            });
            
        } else {
            if (mprn) {
            Fault.find(mprnQuery, function(err, foundMprn){
                if (err){
                    req.flash("error", "MPRN not found. Please provide a valid MPRN.");
                    res.redirect("index");
                } else {
                    res.render("results", {faults: foundMprn});
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

                    var results = {mprn: foundMprn, fault: foundFault};
                    res.render("show", {fault: foundFault, mprn: foundMprn} );
                    }
            });
            
        }
        
    });
    
});




module.exports = router;