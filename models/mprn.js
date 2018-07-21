var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var MprnSchema = new mongoose.Schema({
        mprNo: Number,
        siteName: String,
        buildingNo: Number,
        streetAddress: String,
        secondAddress: String,
        townCity: String,
        postCode: String,
        supplier: String,
        siteContactName: String,
        siteContactNo: String,
        msn: String,
        meterModel: String,
        meterType: String,
        meterMake: String,
        admSerial: String,
        admImei: String,
        admInstallDate: {type: Date, default: null}
    });
    
    
MprnSchema.plugin(passportLocalMongoose);
    
module.exports = mongoose.model("Mprn", MprnSchema);