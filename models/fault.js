const mongoose            =     require("mongoose"),
      AutoIncrement       =     require('mongoose-sequence')(mongoose);


var date = Date.now();
var newSla = new Date(date);
newSla.setDate(newSla.getDate() + 3);

var FaultSchema = new mongoose.Schema({
        jobRef: Number,
        mprNo: Number,
        status: {type: String, default: "Outstanding"},
        requestedDate: {type: Date, default: Date.now},
        slaDate: {type: Date, default: newSla},
        appDate: {type: Date, default: null},
        attendedDate: {type: Date, default: null},
        faultCat: String,
        meterRead: String,
        dmAuthor: {
            id: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
            username: String
            },
        comments: [{
                type: mongoose.Schema.Types.ObjectId, ref: "Comment"
                }]

    });
    
FaultSchema.plugin(AutoIncrement, {inc_field: 'jobRef'});
    
module.exports = mongoose.model("Fault", FaultSchema);