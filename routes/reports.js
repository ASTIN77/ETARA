const express = require("express"),
      router  = express.Router({mergeParams: true}),
      Fault   = require('../models/fault'),
      middleware = require("../middleware/middleware");
      
      // Report routes to be impletented here
      
router.get("/", middleware.isLoggedIn, (req,res) =>{
      res.render("reports");
});

router.post("/query", (req,res) => {
      var reportQuery = {};
      for(var key in req.body){ //could also be req.query and req.params
            req.body[key] !== "" ? reportQuery[key] = req.body[key] : null;
            }
      Fault.find(reportQuery, (err, queryResults) => {
            if(err){
          req.flash("error", err.message);
          res.redirect("/");
        } else {
            console.log(queryResults);
        
            /*res.render("reportResults", { queryResults: queryResults });*/
        }
      });
});
      
module.exports = router;