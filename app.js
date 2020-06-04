//WEB CONFIGRATION
const express = require('express');
const app = express();
var bodyParser = require("body-parser");

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));

darkTheme = true;

//DATABASE

//IMAGES
var personal_icon = "https://s.pngkit.com/png/small/11-116810_man-finance-online-svg-person-icon-woman-png.png";
var shopping_icon = "https://t3.ftcdn.net/jpg/03/13/77/98/240_F_313779888_0Gc6K9Jia3yoOfVrScIbgIQd1Ch9v33m.jpg";
var work_icon = "https://www.clipartkey.com/mpngs/m/74-740881_office-work-clipart-black-and-white.png";
var other_icon = "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT5DVcoflpsNCo81LquWGd3tyVXnN9-M4wWZqrPf7sSe6vJuYL3&usqp=CAU";

// Task = {
//     id : Number,
//     image : String,
//     title : String,
//     dueDate: String,
//     label: String , 
//     status: String ,
//     details : String 
// }
tasks=[
    {
        id : 0,
        image:personal_icon, 
        title:"Add in your first task", 
        dueDate: "01.01.2000", 
        label:"personal" , 
        status:"new" , 
        details:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    }
];
archive=[
    {
        id : 100, 
        image:work_icon, 
        title:"This is archived task", 
        dueDate:"09.12.2020", 
        label:"work" , 
        status:"completed",
        details : "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from 'de Finibus Bonorum et Malorum' by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
    }
];
var curr_id =1;



//ROUTES
app.get("/",function(req,res){
    res.redirect("/toDoApp");
}); 

app.get("/toDoApp",function(req,res){
    res.render("home",{tasks:tasks , archive:archive , darkTheme:darkTheme});
});

app.get("/toDoApp/new",function(req,res){
    res.render("newTask");
});

app.get("/toDoApp/archives", function(req,res){
    res.render("showArchive",{archive : archive , darkTheme:darkTheme});
})

app.post("/toDoApp", function(req,res){
    if(req.body.label=="personal"){
        var img = personal_icon;}
    else if(req.body.label=="shopping"){
        var img = shopping_icon;}
    else if (req.body.label=="work") {
        var img = work_icon;    
    }else {
        var img = other_icon;
    }
    var newTask = {
        id : curr_id,
        image : img,
        title : req.body.title,
        dueDate : req.body.date,
        label : req.body.label,
        status : "new",
        details : req.body.details
    }
    curr_id++;
    tasks.push(newTask);
    res.redirect("/toDoApp");    
});

app.get("/toDoApp/changeTheme" , function(req,res){
    darkTheme = !darkTheme;
    res.redirect("/toDoApp");
});

app.get("/toDoApp/archives/:task_id", function(req,res){
    var found = archive.find(element => element.id==Number(req.params.task_id));
    res.render("show",{task : found, type:"archive" , darkTheme:darkTheme}); 
});

app.get("/toDoApp/:task_id", function(req,res){
    var found = tasks.find(element => element.id==Number(req.params.task_id));
    res.render("show",{task : found, type:"active" , darkTheme:darkTheme}); 
});

app.get("/toDoApp/:task_id/delete" , function(req,res){
    var found = tasks.find(element => element.id==Number(req.params.task_id));
    found.status = "deleted";
    var index = tasks.indexOf(found);
    tasks.splice(index,1);
    var newTask = {
        id : found.id,
        image : found.image,
        title : found.title,
        dueDate : found.dueDate,
        label : found.label,
        status : found.status,
        details : found.details
    }
    archive.push(newTask);
    res.redirect("/toDoApp");
});

app.get("/toDoApp/:task_id/changeStatus", function(req,res){
    var found = tasks.find(element => element.id==Number(req.params.task_id));
    if(found.status==="new"){ 
        found.status = "inProgress";
    }else{  
        found.status = "completed";
        var index = tasks.indexOf(found);
        tasks.splice(index,1);
        var newTask = {
            id : found.id,
            image : found.image,
            title : found.title,
            dueDate : found.dueDate,
            label : found.label,
            status : found.status,
            details : found.details
        }
        archive.push(newTask);
    }
    res.redirect("/toDoApp");
});

app.listen(3000, () => console.log(`Server is running at port 3000!!!`))