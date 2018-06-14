var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
        firstName: String,
        lastName: String,
        username: String,
        email: {type: String, unique: true, required: true},
        password: String,
        isAdmin: {type: Boolean, default: false},
        isManager: {type: Boolean, default: false}
    });
    
UserSchema.plugin(passportLocalMongoose);
    
module.exports = mongoose.model("User", UserSchema);