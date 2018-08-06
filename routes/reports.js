const express = require("express"),
      router  = express.Router({mergeParams: true}),
      Fault   = require('../models/fault'),
      Mprn    = require('../models/mprn'),
      middleware = require("../middleware/middleware");
      
      // Report routes to be impletented here
      
router.get("/", middleware.isLoggedIn, (req,res) =>{
      res.render("reports");
});

router.post("/query", (req,res) => {
  
/*    if(Object.keys(req.body).length ===0) {
        req.flash("error", "Nothing selected. Please enter a search query!");
        res.render("index");
        }*/
      
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
      // and cast to correct types
      for(var key in req.body){  
                req.body[key] !== "" ? reportQuery[key] = req.body[key] : null;
                
                if (req.body.mprNo){
                    reportQuery.mprNo = Number(req.body.mprNo);
                }
                if (req.body.jobRef){
                    reportQuery.jobRef = Number(req.body.jobRef);
                }
            }
              
                // Query using aggregate method to obtain mprn details for each record found.
                  Fault.aggregate([
                    { "$match": reportQuery },
                    { "$lookup": {
                      "from": "mprns",
                      "let": { "mprNo": "$mprNo" },
                      "pipeline": [
                        { "$match": { "$expr": { "$eq": [ "$mprNo", "$$mprNo" ] } } }
                      ],
                      "as": "siteDetails"
                    }},
                    { "$unwind": "$siteDetails" }
                  ]).exec(function (err,faultResults){
                      if(err) {
                        req.flash("error", "Something has went wrong. Please check and try again!");
                        res.render("index");
                      } else {
                        res.render("reportResults", { queryResults: faultResults }) ;  
                      }
                  });
});
                            
module.exports = router;