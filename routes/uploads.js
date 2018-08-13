const express = require("express"),
      router  = express.Router({mergeParams: true}),
      fileUpload = require('express-fileupload'),
      ticketTemplate = require('../public/javascripts/newTicketsUpload.js'),
      mprnTemplate  = require('../public/javascripts/newMprnsUpload.js'),
      csv = require('fast-csv'),
      Fault = require('../models/fault'),
      Mprn  = require('../models/mprn'),
      mongoose = require('mongoose'),
      middleware = require("../middleware/middleware");
      router.use(fileUpload());
      

// UPLOAD TICKETS PAGE - GET ROUTE

router.get("/tickets", middleware.isLoggedIn, (req,res) => {
      res.render("uploads/newTickets");
      
});

// UPLOAD MPRNS PAGE - GET ROUTE

router.get("/mprns", middleware.isLoggedIn, (req,res) => {
      res.render("uploads/newMprns");
      
});

// UPLOAD TICKETS TEMPLATE - GET ROUTE
      
router.get("/faultTemplate", middleware.isLoggedIn, ticketTemplate.get);

// UPLOAD MPRNS TEMPLATE - GET ROUTE
      
router.get("/mprnTemplate", middleware.isLoggedIn, mprnTemplate.get);

// UPLOAD TICKETS - CSV FILES - POST ROUTE

router.post("/tickets", middleware.isLoggedIn, (req,res) => {
      if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
      var faultFile = req.files.file;
      var faults = [];
         
      csv
      .fromString(faultFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
      })
     .on("data", (data) => {
         data['_id'] = new mongoose.Types.ObjectId();
         data.dmAuthor = { id: req.user._id, username: req.user.username };
         faults.push(data);
     })
     .on("end", () => {
         Fault.create(faults, (err, documents) => {
            if (err) {
                req.flash("error", "Please check the uploaded file for errors.");
                console.log(err);
                res.redirect("/");
            } else {
                  req.flash("success", faults.length + " Fault Ticket(s) have been successfully uploaded.");
                  res.redirect("/");
                  }
            });
     });
});

// UPLOAD TICKETS - CSV FILES - POST ROUTE

router.post("/mprns", middleware.isLoggedIn, (req,res) => {
      if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
      var mprnFile = req.files.file;
      var mprns = [];
         
      csv
      .fromString(mprnFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
      })
     .on("data", (data) => {
         data['_id'] = new mongoose.Types.ObjectId();
         data.dmAuthor = { id: req.user._id, username: req.user.username };
        mprns.push(data);
     })
     .on("end", () => {
         Mprn.create(mprns, (err, documents) => {
            if (err) {
                console.log(err, err.message);
                req.flash("error", "Please check the uploaded file for errors.");
                res.redirect("/");
            } else {
                  req.flash("success", mprns.length + " Fault Ticket(s) have been successfully uploaded.");
                  res.redirect("/");
                  }
            });
     });
});
      
module.exports = router;
      
      
      