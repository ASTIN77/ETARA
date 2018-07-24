const express = require("express"),
      router  = express.Router({mergeParams: true}),
      fileUpload = require('express-fileupload'),
      template = require('../public/javascripts/bulkUploadTemplate.js'),
      csv = require('fast-csv'),
      Fault = require('../models/fault'),
      mongoose = require('mongoose'),
      middleware = require("../middleware/middleware");
      router.use(fileUpload());
      

// UPLOAD PAGE - GET ROUTE

router.get("/", middleware.isLoggedIn, (req,res) => {
      res.render("bulkUpload");
      
});

// UPLOAD TICKETS TEMPLATE - GET ROUTE
      
router.get("/template", middleware.isLoggedIn, template.get);

// UPLOAD CSV FILES - POST ROUTE

router.post("/new/faults", middleware.isLoggedIn, (req,res) => {
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
         faults.push(data);
     })
     .on("end", () => {
         Fault.create(faults, (err, documents) => {
            if (err) {
                req.flash("error", "Please check the uploaded file for errors.");
                res.redirect("/");
            } else {
                  req.flash("success", faults.length + " Fault Ticket(s) have been successfully uploaded.");
                  res.redirect("/");
                  }
            });
     });
});
      
module.exports = router;
      
      
      