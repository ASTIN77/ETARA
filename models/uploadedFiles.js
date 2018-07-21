const csv = require('fast-csv'),
      mongoose = require('mongoose'),
      Fault = require('../models/fault'),
      Mprn = require('../models/mprn'),
      User = require('../models/user'),
      Comment = require('../models/comment');
 
exports.post = (req, res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
    var uploadFile = req.files.file;
 
    var faults = [];
         
    csv
     .fromString(uploadFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
          
         faults.push(data);
     })
     .on("end", () => {
         Fault.create(faults, function(err, documents) {
            if (err) throw err;
         });
          
         res.send(faults.length + ' fault tickets have been successfully uploaded.');
     });
};