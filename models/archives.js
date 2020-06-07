var mongoose = require("mongoose");

var archiveSchema = mongoose.Schema({
    id : Number,
    image : String,
    title : String,
    dueDate: String,
    dueTime : String,
    label: String , 
    status: String ,
    details : String, 
});

module.exports = mongoose.model("Archive", archiveSchema);