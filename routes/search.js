const   express             =       require("express"),
        router              =       express.Router({mergeParams: true}),
        Fault               =       require("../models/fault"),
        Mprn                =       require("../models/mprn"),
        middleware          =       require("../middleware/middleware");
        

router.post("/", middleware.isLoggedIn, (req,res) => {

    let ticket = req.body.ticketRef, mprn = req.body.mprnRef;
    let ticketQuery = {'jobRef': ticket}, mprnQuery = {'mprNo': mprn};

    if (ticket.length) { // If ticket input field is not empty/undefined

        Fault.findOne(ticketQuery).populate("comments").exec(function(err, foundFault){
            if(err){
                req.flash("error", "Please provide a valid Ticket Reference!");
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
    }
    if (mprn) { // If mprn number input box is not empty/undefined
        
        Fault.find(mprnQuery).populate("comments").exec(function(err, foundMprn){
            if(err){
                req.flash("error", "Please provide a valid MPRN!");
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
    
    if(!ticket.length && !mprn){ // if mpnr and ticket ref are both blank
        req.flash("error", "Please provide a valid Ticket Reference or valid MPRN");
        res.redirect("/");
    }
});

// SHOW FAULT TICKET ROUTE

router.get("/:id", middleware.isLoggedIn, (req, res) => {
    
    Fault.findById(req.params.id).populate("comments").exec((err, foundFault) => {
    if (err) {
        console.log(err);
    } else {
        var query = {'mprNo': foundFault.mprNo};
        Mprn.findOne(query, (err, foundMprn) => {
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