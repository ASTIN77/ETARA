const mongoose            =     require("mongoose"),
      AutoIncrement       =     require('mongoose-sequence')(mongoose);
/*var passportLocalMongoose =     require("passport-local-mongoose");*/

var date = Date.now();
var newSla = new Date(date);
newSla.setDate(newSla.getDate() + 3);

var NotesSchema = new mongoose.Schema({
        comments: String,
        createdDate: {type: Date, default: Date.now},
        slaDate: {type: Date, default: newSla},
        author: {
            id: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
            username: String
            }
    });
    
    
module.exports = mongoose.model("Notes", NotesSchema);