const express             = require("express"),
      router              = express.Router({mergeParams: true}),
      json2csv            = require('json2csv').parse,
      Fault               = require('../models/fault'),
      middleware = require("../middleware/middleware");
      
      // Report routes to be impletented here
      
router.get("/", middleware.isLoggedIn, (req,res) =>{
      res.render("reports/buildReport");
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
            delete reportQuery.action; // remove the action attribute sent over depending on button press from query
              
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
                        if (req.body.action ==='Export Report') {
                                                                        // Create Headers Based On Fault Schema
                          const fields = ['mprNo', 'siteDetails.siteName', 'siteDetails.buildingNo', 'sitDetails.streetAddress', 'siteDetails.secondAddress', 
                                          'siteDetails.townCity', 'siteDetails.postCode' , 'siteDetails.supplier', 'siteDetails.siteContactName',
                                          'siteDetails.siteContactNo', 'siteDetails.msn', 'siteDetails.meterModel', 'siteDetails.meterType', 'siteDetails.meterMake', 
                                          'siteDetails.admSerial', 'siteDetails.admImei', 'siteDetails.admInstallDate'];

                          const opts = { fields };
                          // Convert JSON to CSV File
                          /*const json2csvParser = new Json2csvParser({ fields});*/
                          const csv = json2csv(faultResults, opts);
                          
                          //Open on users device with filename "reportResults.csv"
                          res.set("Content-Disposition", "attachment;filename=reportResults.csv");
                          res.set('Content-Type', 'text/csv');
                          res.status(200).send(csv);
                        } else {
                          res.render("reports/reportResults", { queryResults: faultResults }) ;  
                        }
                      }
                  });
});

module.exports = router;