var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var Task = require("../models/tasks");
var Archive = require("../models/archives");

var UserSchema = new mongoose.Schema({
    name : String,
    username: String,
    password: String,
    tasks : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Task"
        }
    ],
    archives : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Archive"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);
 
module.exports = mongoose.model("User", UserSchema);