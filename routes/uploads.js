const express = require("express"),
      router  = express.Router({mergeParams: true}),
      fileUpload = require('express-fileupload'),
      template = require('../routes/bulkUploadTemplate.js'),
      middleware = require("../middleware/middleware");

      router.use(fileUpload());
      
      // Upload routes to be impletented here
      
router.get("/template", middleware.isLoggedIn, template.get);

router.get("/", middleware.isLoggedIn, (req,res) => {
      res.render("bulkUpload");
      
});

router.post("/", middleware.isLoggedIn, (req,res) => {
      res.sendFile(__dirname + '/uploadFiles.ejs');
});

router.post("/new/faults", middleware.isLoggedIn, (req,res) => {
      
});
module.exports = router;
      
      
      