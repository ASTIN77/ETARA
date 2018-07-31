var mongoose = require("mongoose");

var MprnSchema = new mongoose.Schema({
        mprNo: {type: Number, unique: true, required: true},
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
    
module.exports = mongoose.model("Mprn", MprnSchema);