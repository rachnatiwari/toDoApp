var mongoose = require("mongoose");

var taskSchema = mongoose.Schema({
    id : Number,
    image : String,
    title : String,
    dueDate: String,
    label: String , 
    status: String ,
    details : String, 
});

module.exports = mongoose.model("Task", taskSchema);