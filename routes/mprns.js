const express = require("express"),
      router  = express.Router({mergeParams: true}),
      Mprn = require("../models/mprn"),
      middleware = require("../middleware/middleware");
      
// CREATE NEW MPRN - GET ROUTE

router.get("/", middleware.isLoggedIn, (req, res) => {
  res.render("new/newMprn");
});

router.post("/create", middleware.isLoggedIn, (req, res) => {

  //  The following line of code sanitizes the visit notes section 
  //  to remove any scripts that a user may inject
  req.body.text = req.sanitize(req.body.text);

  var mprnDetails = { mprNo: req.body.mprn, supplier: req.body.supplier, 
                   siteName: req.body.siteName, buildingNo: req.body.buildingNo,
                   streetAddress: req.body.streetAddress1, secondAddress: req.body.streetAddress2,
                   townCity: req.body.townCity, postCode: req.body.postCode, 
                   siteContactName: req.body.siteContact, siteContactNo: req.body.contactNo,
                   msn: req.body.msn, meterMake: req.body.meterMake, meterModel: req.body.meterModel,
                   meterType: req.body.meterType, admImei: req.body.admImei, admSerial: req.body.admSerial
                  };
  
          // Create New Fault Ticket
  
          Mprn.create(mprnDetails, (err, newMprn) => {
            if (err) {
              /*req.flash("error", "Oops, Error Creating Mprn. Please request assistance from your system administrator.");*/
              console.log(err.message);
              res.render("/");
            } else {
                  var response =  'Mprn: ' + newMprn.mprNo + ' has been successfully created.';
                  req.flash('success', response);
                  res.redirect("/");          
              }
            });
        });
        
module.exports = router;