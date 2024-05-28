const express = require("express"),
      router  = express.Router({mergeParams: true}),
      Fault   = require("../models/fault"),
      Mprn = require("../models/mprn"),
      Comment = require("../models/comment"),
      middleware = require("../middleware/middleware");

// CREATE NEW TICKET - GET ROUTE

router.get("/", middleware.isLoggedIn, (req, res) => {
  res.render("new/newTicket");
});

// CREATE TICKET WITH MPRN DETAILS - POST ROUTE

router.post("/mprn", middleware.isLoggedIn, (req, res) => {

  var mprnQuery = { 'mprNo': req.body.mprn };
   // First, ensure no active ticket is 
  // outstanding againt the chosen MPRN.
  
      Fault.where('mprNo', req.body.mprn).where('status', 'Outstanding').exec((err,foundFault) => {
        if(err){
          req.flash("error", err.message);
          res.redirect("/");
        } else {
            if(!foundFault.length){

              Mprn.findOne(mprnQuery, (err, foundMprn) => {
                if (err) {
                  req.flash("error", "Something went wrong. Please contact the System Administrator");
                  res.redirect("/tickets/");
            
                } else {
                  if (!foundMprn) {
                    req.flash("error", "Please enter a valid mprn!");
                    res.redirect("/tickets/");
                  } else {
                    res.render("new/createTicket", { mprn: foundMprn });
                  }
                }
              });
            } else {
                  var response = 'An Outstanding Fault Ticket with Reference No: <a href="/search/'+ foundFault[0]._id +'">' + foundFault[0].jobRef + '</a> already exists.'; 
                  req.flash("error", response);
                  res.redirect("/tickets/");
              }
          }
      });
  });

// CREATE NEW TICKET - POST ROUTE


router.post("/create", middleware.isLoggedIn, (req, res) => {

  //  The following line of code sanitizes the visit notes section 
  //  to remove any scripts that a user may inject
  req.body.faultIssue.text = req.sanitize(req.body.faultIssue.text);

  var dmAuthor = { id: req.user._id, username: req.user.username };
  var newFault = { mprNo: req.body.mprn, meterRead: req.body.meterRead, 
                   faultCat: req.body.faultCat, faultIssue: req.body.faultIssue,
                   appDate: req.body.appDate, dmAuthor: dmAuthor };
  
          // Create New Fault Ticket
  
          Fault.create(newFault, (err, newFault) => {
            if (err) {
              req.flash("error", "Oops, Error Creating New Ticket. Please request assistance from your system administrator.");
              res.render("/");
            } else {
                  var response =  'Fault Ticket Reference SMSDM:  <a href="/search/'+ newFault._id +'">' + newFault.jobRef + '</a> has been successfully created.';
                  req.flash('success', response);
                  res.redirect("/");          
              }
            });
        });

  

// EDIT TICKET - POST ROUTE

router.put("/:id", middleware.isLoggedIn, (req, res) => {
  
  
  // Creates the updated Fault Details
   var updatedData ={};
   for(var key in req.body.fault){  
            req.body.fault[key] !== "" ? updatedData[key] = req.body.fault[key] : null;
   }

  req.body.comment.text = req.sanitize(req.body.comment.text);  // sanitizes the visit notes section to remove any scripts

  // Find & update the correct Fault Ticket

  Fault.findOneAndUpdate({_id: req.params.id}, updatedData, (err, updatedFault) => {

    if (err) {
      req.flash("error", "An error has occured. No updated have been saved.");
    } else {
      // Get latest comment and update
      if (req.body.comment.text) { // make sure a comment has been added
        Comment.create(req.body.comment, (err, comment) => {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/");
          } else {
            comment.dmAuthor.id = req.user._id;
            comment.dmAuthor.username = req.user.username;
            comment.save();
            console.log(comment);
            // Push comments to the newly created Fault & Save
            updatedFault.comments.push(comment);
            updatedFault.save(); // Save the fault with the fault note referenced
          }
        });
      }
      // Then, Save mprn details to
      // capture any changed details such as ADM serial or IMEI
      
      var updatedMprnData ={};
      
      for(var key in req.body.mprn){  
            req.body.mprn[key] !== "" ? updatedMprnData[key] = req.body.mprn[key] : null;
            
   }
      Mprn.findOneAndUpdate({mprNo: req.body.mprn.mprNo}, updatedMprnData, (err, updatedMprn) => {
        if (err) {
          req.flash("error", err.message);
          res.redirect("/");
              } 
      });
    }
        var response =  'Fault Ticket Reference SMSDM:  <a href="/search/'+ req.params.id +'">' + req.body.fault.jobRef + '</a> has been successfully updated.';
        req.flash('success', response);
        res.redirect("/"); 
      });
});

// DELETE TICKET - POST ROUTE

router.delete("/:id", middleware.isLoggedIn, (req,res, next) => {
  
     Fault.findById({_id: req.params.id}, (err, foundTicket) => {
       Comment.remove({"_id": {$in: foundTicket.comments}
         }, (err) => {
           if(err) return next(err);
           foundTicket.remove();
           req.flash("success", "Ticket SMSDM " + foundTicket.jobRef +" successfully removed.");
           res.redirect("/") ;
       });
      });
});

module.exports = router;
