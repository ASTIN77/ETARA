const mongoose            =     require("mongoose");


var CommentSchema = new mongoose.Schema({
        text: String,
        dmAuthor: {
            id: {type: mongoose.Schema.ObjectId, ref: "User" },
            username: String
            }
    });
    

module.exports = mongoose.model("Comment", CommentSchema);