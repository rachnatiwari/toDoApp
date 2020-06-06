//WEB CONFIGRATION
var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    Task                  = require("../models/tasks");
    Archive               = require("../models/archives");
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")

//SETTING UP DATABASE
mongoose.connect("mongodb://localhost:27017/toDoAppDB", { useNewUrlParser: true, useUnifiedTopology: true });
var app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//Authentication Setup
app.use(require("express-session")({
    secret: "Random key for toDoApp",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Passing in the current user in every page
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
 });

darkTheme = true;

//IMAGES
var personal_icon = "https://s.pngkit.com/png/small/11-116810_man-finance-online-svg-person-icon-woman-png.png";
var shopping_icon = "https://t3.ftcdn.net/jpg/03/13/77/98/240_F_313779888_0Gc6K9Jia3yoOfVrScIbgIQd1Ch9v33m.jpg";
var work_icon = "https://www.clipartkey.com/mpngs/m/74-740881_office-work-clipart-black-and-white.png";
var other_icon = "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT5DVcoflpsNCo81LquWGd3tyVXnN9-M4wWZqrPf7sSe6vJuYL3&usqp=CAU";

// tasks=[
//     {
//         id : 0,
//         image:personal_icon, 
//         title:"Add in your first task", 
//         dueDate: "01.01.2000", 
//         label:"personal" , 
//         status:"new" , 
//         details:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
//     }
// ];
// archive=[
//     {
//         id : 100, 
//         image:work_icon, 
//         title:"This is archived task", 
//         dueDate:"09.12.2020", 
//         label:"work" , 
//         status:"completed",
//         details : "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from 'de Finibus Bonorum et Malorum' by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
//     }
// ];
// var curr_id =1;

//AUTHENTICATION ROUTES
//Signup page 
app.get("/toDoApp/signup",function(req,res){
    res.render("signup");
});

//Create or register new user
app.post("/toDoApp/signup",function(req,res){
    User.register(new User({username : req.body.username , name : req.body.Name}),req.body.password , function(err,user){
        if(err){
            return res.redirect('/toDoApp/signup');
        }
        passport.authenticate('local')(req,res,function(){
            res.redirect("/toDoApp/newUser");
        });
    });
});

//Display page for login
app.get("/toDoApp/login" , function(req,res){
    res.render("login");
});

//Logging in the user
app.post("/login", passport.authenticate("local", {
    successRedirect: "/toDoApp",
    failureRedirect: "/toDoApp/login"
}) ,function(req, res){
});

//Log out current user
app.get("/logout" , function(req,res){
    req.logout();
    res.redirect("/toDoApp/signup");
});

//ROUTES
//Server starting page
app.get("/", isLoggedIn ,  function(req,res){
    res.redirect('/toDoApp/' + req.user._id);
}); 

//Redirecting the home page to user's home page
app.get("/toDoApp/newUser", isLoggedIn , function(req,res){
    res.redirect('/toDoApp/' + req.user._id);
    var newTask = {
        image:personal_icon, 
        title:"Add in your first task", 
        dueDate: "01.01.2000", 
        label:"personal" , 
        status:"new" , 
        details:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    }
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
            res.redirect('/toDoApp/signup');
        } else {
         Task.create(newTask, function(err, task){
            if(err){
                console.log(err);
            } else {
                user.tasks.push(task);
                user.save();
                res.redirect('/toDoApp/' + user._id);
            }
         });
        };   
    });
});

//Show the tasks display or home page for the user
app.get("/toDoApp/:user_id", isLoggedIn ,function(req,res){
    User.findById(req.params.user_id).populate("tasks").exec(function(err, found){
        if(err){
            console.log(err);
        } else {
            console.log(found)
            res.render("home", {tasks: found,darkTheme:darkTheme});
        }
    });
});

//New task form
app.get("/toDoApp/:user_id/new",function(req,res){
    res.render("newTask");
});

//Show archived tasks for the user
app.get("/toDoApp/:user_id/archives", function(req,res){
    User.findById(req.params.user_id).populate("archives").exec(function(err, found){
        if(err){
            console.log(err);
        } else {
            console.log(found)
            res.render("showArchive", {archives: found,darkTheme:darkTheme});
        }
    });
});

//Creating new task for the user
app.post("/toDoApp/:user_id/new", function(req,res){
    if(req.body.task.label=="personal"){
        var img = personal_icon;}
    else if(req.body.task.label=="shopping"){
        var img = shopping_icon;}
    else if (req.body.task.label=="work") {
        var img = work_icon;    
    }else {
        var img = other_icon;
    }
    var newTask = req.body.task;
    newTask.image = img;
    newTask.status = "new";
    console.log(task);
    User.findById(req.params.user_id, function(err, user){
        if(err){
            console.log(err);
            res.redirect('/toDoApp/' + user._id);
        } else {
         Task.create(newTask, function(err, task){
            if(err){
                console.log(err);
            } else {
                user.tasks.push(task);
                user.save();
                res.redirect('/toDoApp/' + user._id);
            }
         });
        };   
    });
}); 

//Toggle theme 
app.get("/toDoApp/:user_id/changeTheme" , function(req,res){
    darkTheme = !darkTheme;
    res.redirect('/toDoApp/' + req.user._id);
});

//Show selected archive task
app.get("/toDoApp/:user_id/archives/:task_id", function(req,res){
    User.findById(req.params.user_id, function(err,user){
        if(err){
            console.log(err);
        }else{
            Archive.findById(req.params.task_id ,function(err,found){
                if(err){
                    console.log(err);
                }else{
                    res.render("show",{task : found, type:"archive" , darkTheme:darkTheme}); 
                }
            })
        }
    });
});

//Show selected active task
app.get("/toDoApp/:user_id/:task_id", function(req,res){
    User.findById(req.params.user_id, function(err,user){
        if(err){
            console.log(err);
        }else{
            Task.findById(req.params.task_id ,function(err,found){
                if(err){
                    console.log(err);
                }else{
                    res.render("show",{task : found, type:"active" , darkTheme:darkTheme}); 
                }
            });
        }
    }); 
});

//Delete any active task
app.get("/toDoApp/:user_id/delete/:task_id" , function(req,res){
    // var found = tasks.find(element => element.id==Number(req.params.task_id));
    // found.status = "deleted";
    // var index = tasks.indexOf(found);
    // tasks.splice(index,1);
    // var newTask = {
    //     id : found.id,
    //     image : found.image,
    //     title : found.title,
    //     dueDate : found.dueDate,
    //     label : found.label,
    //     status : found.status,
    //     details : found.details
    // }
    // archive.push(newTask);
    User.findById(req.params.user_id, function(err,user){
        if(err){
            console.log(err);
        }else{
            Task.findById(req.params.task_id ,function(err,found){
                if(err){
                    console.log(err);
                }else{
                    found.status = "deleted";
                    user.archives.push(found);
                    user.save();
                    user.tasks.pull(found);                   
                    res.render("show",{task : found, type:"archive" , darkTheme:darkTheme}); 
                }
            })
        }
    })
    //res.redirect('/toDoApp/' + req.user._id);
});

//Change the status of the task
app.get("/toDoApp/:user_id/:task_id/changeStatus", function(req,res){
    User.findById(req.params.user_id, function(err,user){
        if(err){
            console.log(err);
        }else{
            Task.findById(req.params.task_id ,function(err,found){
                if(err){
                    console.log(err);
                }else{
                    if(found.status==="new"){ 
                        found.status = "inProgress";
                    }else{  
                        found.status = "completed";
                        user.archives.push(found);
                        user.save();
                        user.tasks.pull(found);
                    }                    
                    res.render("show",{task : found, type:"archive" , darkTheme:darkTheme}); 
                }
            })
        }
    })
    //res.redirect('/toDoApp/' + req.user._id);
});

//Middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, () => console.log(`Server is running at port 3000!!!`))