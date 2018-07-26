const express = require("express"),
      router  = express.Router({mergeParams: true}),
      Fault   = require('../models/fault'),
      Mprn    = require('../models/mprn'),
      async   = require("async"),
      middleware = require("../middleware/middleware");
      
      // Report routes to be impletented here
      
router.get("/", middleware.isLoggedIn, (req,res) =>{
      res.render("reports");
});

router.post("/query", (req,res) => {
      
      // if query specifies a requested Date
      
      if(req.body.requestedDate.length){
            var startDate = new Date(req.body.requestedDate); /*+ "T00:00:00Z";*/
            startDate.setHours(0,0,0,0);
            var endDate = new Date(req.body.requestedDate); /*+ "T23:59:59Z";*/
            endDate.setHours(23,59,59,999);
            req.body.requestedDate = {$lte: endDate, $gte: startDate};
      }
      var reportQuery = {};
      
      // Build a query [reportQuery] using only populated input requests
      
      for(var key in req.body){  
            req.body[key] !== "" ? reportQuery[key] = req.body[key] : null;
            }

      // Execute the query using the reportQuery object parameters
      
      Fault.find(reportQuery, (err, faultResults) => {
            
            var mprns;
            if(err){
                  req.flash("error", err.message);
                  res.redirect("/");
            }
            
      // map reduce function to return an array of mprn numbers
      // for each found Fault
        
       mprns = faultResults.map(function (fault) { return fault.mprNo; });
       
       // Find MPRN documents that correspond to the variable 'mprns' array
          
       Mprn.find({mprNo: {$in: mprns}}, function (err, mprnResults) {
            if (err) {
                  req.flash("error", err.message);
                  res.redirect("/");
                  return;
                  }
                  
            // For each Fault found, amend the query results and
            // assign attributes from the MPRn document to the Fault Document

            faultResults.forEach(function (fault) {
                  fault.mprnResults = mprnResults.filter(function (mprn) {
                  return fault.siteName = mprn.siteName, fault.postCode = mprn.postCode;
                  });
            });
            res.render("reportResults", { queryResults: faultResults });   
                  
            });
      });
});
      
module.exports = router;