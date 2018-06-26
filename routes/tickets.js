const express = require("express"),
      router  = express.Router({mergeParams: true}),
      Fault   = require("../models/fault"),
      Mprn = require("../models/mprn"),
      Comment = require("../models/comment"),
      middleware = require("../middleware/middleware");

// CREATE NEW TICKET - GET ROUTE

router.get("/", middleware.isLoggedIn, function(req, res) {
  res.render("new");
});

// CREATE TICKET WITH MPRN DETAILS - POST ROUTE

router.post("/mprn", middleware.isLoggedIn, function(req, res) {

  var query = {
    'mprNo': req.body.mprn
  };

  Mprn.findOne(query, function(err, foundMprn) {
    if (err) {
      req.flash("error", "Something went wrong. Please contact the System Administrator");
      res.redirect("/tickets/");

    } else {
      if (!foundMprn) {
        req.flash("error", "Please enter a valid mprn!");
        res.redirect("/tickets/");
      } else {
        res.render("create", {
          mprn: foundMprn
        });
      }
    }
  });
});

// CREATE NEW TICKET - POST ROUTE

router.post("/new/create", middleware.isLoggedIn, function(req, res) {

  //  The following line of code sanitizes the visit notes section 
  //  to remove any scripts that a user may inject
  req.body.comment.text = req.sanitize(req.body.comment.text);
  var mprn = req.body.mprn, faultCat = req.body.faultCat, meterRead = req.body.meterRead;
  var dmAuthor = { id: req.user._id, username: req.user.username };
  var newFault = { mprNo: mprn, meterRead: meterRead, faultCat: faultCat, dmAuthor: dmAuthor };

// Create New Fault Ticket

  Fault.create(newFault, function(err, newFault) {
    if (err) {
      req.flash("error", "Oops, Error Creating New Ticket. Please request assistance from your system administrator.");
      res.render("index");
    } else {

      // Create a new Comment
      // and add to the Fault Ticket
      if (req.body.comment.text) { // make sure a comment has been added
        Comment.create(req.body.comment, function(err, comment) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/");
          } else {
            comment.dmAuthor.id = req.user._id;
            comment.dmAuthor.username = req.user.username;
            //save comment
            comment.save();
            // Push comments to the newly created Fault & Save
            newFault.comments.push(comment);
            newFault.save(); // Save the fault with the fault note referenced
            }
        });
      }
            var response =  'Fault Ticket Reference SMSDM:  <a href="/search/'+ newFault._id +'">' + newFault.jobRef + '</a> has been successfully created.';
            req.flash('success', response);
            res.redirect("/");          
      }
    });
});


// EDIT TICKET - POST ROUTE

router.put("/:id", middleware.isLoggedIn, function(req, res) {

  //  The following line of code sanitizes the visit notes section 
  //  to remove any scripts that a user may inject

  req.body.comment.text = req.sanitize(req.body.comment.text);

  // Creates the updated Fault Details
  var updatedData = {
      meterRead: req.body.fault.meterRead, faultCat: req.body.fault.faultCat, status: req.body.fault.status,
      dmAuthor: { id: req.user._id, username: req.user.username }
  };
  // Find & update the correct Fault Ticket

  Fault.findOneAndUpdate({
    _id: req.params.id
  }, updatedData, function(err, updatedFault) {

    if (err) {
      req.flash("error", "An error has occured. No updated have been saved.");
    } else {

      // Get latest comment and update
      if (req.body.comment.text) { // make sure a comment has been added

        Comment.create(req.body.comment, function(err, comment) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/");
            console.log(err);

          } else {
            comment.dmAuthor.id = req.user._id;
            comment.dmAuthor.username = req.user.username;
            comment.save();
            // Push comments to the newly created Fault & Save
            updatedFault.comments.push(comment);
            updatedFault.save(); // Save the fault with the fault note referenced
          }
        });
      }

      // Then, Save mprn details to
      // capture any changed details such as ADM serial or IMEI

      var updatedMprnData = {
        supplier: req.body.mprn.supplier, sitename: req.body.mprn.siteName, buildingNo: req.body.mprn.buildingNo,
        streetAddress1: req.body.mprn.streeAddress1, streetAddress2: req.body.mprn.streeAddress2, townCity: req.body.mprn.townCity,
        postCode: req.body.mprn.postCode, siteContactName: req.body.mprn.siteContactName, siteContactNo: req.body.mprn.siteContactNo,
        msn: req.body.mprn.msn, meterModel: req.body.mprn.meterModel, meterMake: req.body.mprn.meterMake,
        meterType: req.body.mprn.meterType, admSerial: req.body.mprn.admSerial, admImei: req.body.mprn.admImei
      };

      Mprn.findOneAndUpdate(req.body.mprNo, updatedMprnData, function(err, updatedMprn) {
        if (err) {
          req.flash("error", err.message);
          res.redirect("/");
          console.log(err);
        } 
      });
    }
        var response =  'Fault Ticket Reference SMSDM:  <a href="/search/'+ req.params.id +'">' + req.body.fault.jobRef + '</a> has been successfully updated.';
        req.flash('success', response);
        res.redirect("/"); 
    
  });
});

// DELETE TICKET - POST ROUTE

router.delete("/:id", middleware.isLoggedIn, function(req,res){
     Fault.findByIdAndRemove({
    _id: req.params.id
  }, function(err, foundTicket){
         if(err){
            req.flash("error", "Unable To Delete Ticket. Please Contact Support Administrator.");
         } else {
            req.flash("success", "Ticket SMSDM " + foundTicket.jobRef +" successfully removed.");
            res.redirect("/") ;   
         }
      });
});

module.exports = router;
