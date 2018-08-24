const express                   =   require("express"),
      router                    =   express.Router({mergeParams: true}),
      fileUpload                =   require('express-fileupload'),
      ticketTemplate            =   require('../public/javascripts/newTicketsUpload.js'),
      mprnTemplate              =   require('../public/javascripts/newMprnsUpload.js'),
      cancellationTemplate      =   require('../public/javascripts/newCancellationsUpload.js'),
      updateTicketsTemplate     =   require('../public/javascripts/updateTickets.js'),
      csv                       =   require('fast-csv'),
      async                     =   require('async'),
      Fault                     =   require('../models/fault'),
      Mprn                      =   require('../models/mprn'),
      Comment                   =   require('../models/comment'),
      mongoose                  =   require('mongoose'),
      middleware                =   require("../middleware/middleware");
      router.use(fileUpload());
      mongoose.promise          = Promise;
      

// UPLOAD TICKETS PAGE - GET ROUTE

router.get("/tickets", middleware.isLoggedIn, (req,res) => {
      res.render("uploads/newTickets");
      
});

// UPLOAD MPRNS PAGE - GET ROUTE

router.get("/mprns", middleware.isLoggedIn, (req,res) => {
      res.render("uploads/newMprns");
      
});

// UPLOAD CANCELLATIONS PAGE - GET ROUTE

router.get("/cancellations", middleware.isLoggedIn, (req,res) => {
      res.render("uploads/newCancellations");
      
});

// UPLOAD UPDATE TICKETS PAGE - GET ROUTE

router.get("/updateTickets", middleware.isLoggedIn, (req,res) => {
      res.render("uploads/updateTickets");
      
});

// UPLOAD TICKETS TEMPLATE - GET ROUTE
      
router.get("/faultTemplate", middleware.isLoggedIn, ticketTemplate.get);

// UPLOAD MPRNS TEMPLATE - GET ROUTE
      
router.get("/mprnTemplate", middleware.isLoggedIn, mprnTemplate.get);

// UPLOAD CANCELLATIONS TEMPLATE - GET ROUTE
      
router.get("/cancellationTemplate", middleware.isLoggedIn, cancellationTemplate.get);

// UPDATE TICKETS TEMPLATE - GET ROUTE
      
router.get("/updateTicketsTemplate", middleware.isLoggedIn, updateTicketsTemplate.get);

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
                  req.flash("success", documents.length + " Fault Ticket(s) have been successfully uploaded.");
                  res.redirect("/");
                  }
            });
     });
});

// UPLOAD MPRNS - CSV FILES - POST ROUTE

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
                  req.flash("success", documents.length + " Fault Ticket(s) have been successfully uploaded.");
                  res.redirect("/");
                  }
            });
     });
});

// CANCEL TICKETS - CSV FILES - POST ROUTE

router.post("/cancellations", middleware.isLoggedIn, (req,res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
      var cancellationFile = req.files.file;
      var cancellations = [];
         
      csv
      .fromString(cancellationFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
      })
     .on("data", (data) => {
         data.dmAuthor = { id: req.user._id, username: req.user.username };
         cancellations.push(data);
     })
     .on("end", () => {
         
         for(var i = 0; i < cancellations.length; i++){

                let jobRef = cancellations[i].jobRef;
                let status = cancellations[i].status;
                let isCancelledReason = cancellations[i].isCancelledReason;
                let updates = { 'status': status, 'isCancelledReason': isCancelledReason };

          /*  for(var j = 0; j < cancellations.length; j++){*/
                
                Fault.update({'jobRef': jobRef}, updates, (err, cancelled) =>{
                    if (err) {
                        console.log(err, err.message);
                        req.flash("error", "Please check the uploaded file for errors.");
                        res.redirect("/");
                    }
                });
         /*   }*/
        }
            req.flash("success", " Fault Ticket(s) have been successfully cancelled.");
            res.redirect("/");
    });
    
});

// UPDATE TICKETS - CSV FILES - POST ROUTE

router.post("/updateTickets", middleware.isLoggedIn, (req,res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
        
      var updatesFile = req.files.file;
      var updates = [];
         
      csv
      .fromString(updatesFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
      })
     .on("data", (data) => {
             //  The following line of code sanitizes the visit notes section 
             //  to remove any scripts that a user may inject
            /*data.comments.text = req.sanitize(data.comments);*/
            updates.push(data);
     })
     .on("end", () => {
         
         for(var i=0; i < updates.length; i++) {

                var jobRef = Number(updates[i].jobRef);
                var status = updates[i].status;
                var appDate = Date(updates[i].appDate);
                var attendedDate = Date(updates[i].attendedDate);
                var faultCat = updates[i].faultCat;
                var meterRead = updates[i].meterRead;
                var comments = { 'text': '' };
                comments.text = updates[i].comment;
                
                console.log(comments);

                
                var faultUpdatesFields = { 'jobRef': jobRef, 'status': status, 'appDate': appDate, 'attendedDate': attendedDate, 'faultCat': faultCat,
                                'meterRead': meterRead};
                
                var updatedFaults = Fault.findOneAndUpdate( {'jobRef': jobRef }, faultUpdatesFields, (err, updatedFault) => {
                    if (err) {
                        req.flash("error", "Please check the updates file for errors.");
                        /*res.redirect("/");*/
                    } else {
                        // Construct A new Comment
                        // Get latest comment and update
                        if (comments.text) { // make sure a comment has been added

                                 Comment.create(comments, (err, comment) => {
                                 if (err) {
                                     req.flash("error", err.message);
                                     res.redirect("/");
                                     } else {
                                         console.log(comments);
                                         // Push comments to the newly created Fault & Save
                                         comment.dmAuthor.id = req.user._id;
                                         comment.dmAuthor.username = req.user.username;
                                         console.log(comment);
                                         comment.save();
                                          // Save the fault with the fault note referenced
                                        
                                     }
                                    
                                     updatedFault.comments.push(comment);
                                     updatedFault.save();
                                 });
                        
                            
                            }

                        }
                        
                        
                });
                
         }
         
            
        
    });
            
    req.flash("success", " Fault Ticket(s) have been successfully updated.");
            res.redirect("/");
});
      
module.exports = router;