//WEB CONFIGRATION
var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    Task                  = require("./models/tasks");
    Archive               = require("./models/archives");
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")

//SETTING UP DATABASE
mongoose.connect("mongodb://localhost:27017/toDoAppDB", { useNewUrlParser: true, useUnifiedTopology: true });
var app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//AUTHENTICATION SETUP
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

//AUTHENTICATION ROUTES
//Signup page 
app.get("/toDoApp/signup",function(req,res){
    res.render("signup",{darkTheme:darkTheme});
});

//Create or register new user
app.post("/toDoApp/signup",function(req,res){
    User.register(new User({username : req.body.username , name : req.body.name}),req.body.password , function(err,user){
        if(err){
            console.log(err);
            res.redirect('/toDoApp/signup');
        }
        passport.authenticate('local')(req,res,function(){
            res.redirect("/toDoApp/newUser");
        });
    });
});

//Display page for login
app.get("/toDoApp/login" , function(req,res){
    res.render("login",{darkTheme:darkTheme});
});

//Logging in the user
app.post("/toDoApp/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/toDoApp/login"
}) ,function(req, res){
});

//Log out current user
app.get("/toDoApp/logout" , function(req,res){
    req.logout();
    res.redirect("/toDoApp/signup");
});

//ROUTES
//Server starting page
app.get("/", isLoggedIn ,  function(req,res){
    res.redirect('/toDoApp/' + req.user._id);
}); 

//Redirecting the home page to a new user's home page
app.get("/toDoApp/newUser", isLoggedIn , function(req,res){
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
                res.redirect('/toDoApp/' + req.user._id);
            }
         });
        };   
    });
});

//Toggle theme 
app.get("/toDoApp/changeTheme", function(req,res){
    darkTheme = !darkTheme;
    res.redirect('/');
});

//Show the tasks display or home page for the user
app.get("/toDoApp/:user_id", isLoggedIn ,function(req,res){
    //console.log(req.user);
    User.findById(req.user._id).populate("tasks").exec(function(err, found){
        if(err){
            console.log(err);
        } else {
            res.render("home", {user:found,darkTheme:darkTheme});
        }
    });
});

//New task form
app.get("/toDoApp/:user_id/new", isLoggedIn , function(req,res){
    res.render("newTask");
});

//Show archived tasks for the user
app.get("/toDoApp/:user_id/archives", isLoggedIn, function(req,res){
    User.findById(req.params.user_id).populate("archives").exec(function(err, found){
        if(err){
            console.log(err);
        } else {
            res.render("showArchive", {user: found,darkTheme:darkTheme});
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
    User.findById(req.params.user_id, function(err, user){
        if(err){
            console.log(err);
            res.redirect('/toDoApp/' + toString(user._id));
        } else {
         Task.create(newTask, function(err, task){
            if(err){
                console.log(err);
            } else {
                user.tasks.push(task);
                user.save();
                res.redirect('/toDoApp/' + toString(user._id));
            }
         });
        };   
    });
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

//Delete any active task
app.get("/toDoApp/:user_id/:task_id/delete" , function(req,res){
    User.findById(req.params.user_id, function(err,user){
        if(err){
            console.log(err);
        }else{
            Task.findByIdAndUpdate(req.params.task_id ,{"status" : "deleted"},function(err,result){
                if(err){
                    console.log(err)
                }else{
                    var newArchiveTask = {
                        image : result.image,
                        title : result.title,
                        dueDate: result.dueDate,
                        label: result.label , 
                        status: "deleted" ,
                        details : result.details,
                    }
                    Archive.create(newArchiveTask, function(err, newArchive){
                        if(err){
                            console.log(err);
                        } else {
                            user.archives.push(newArchive);
                            user.tasks.pull(result);
                            user.save();
                            Task.findByIdAndRemove(req.params.task_id,function(err,removedTask){
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log(user);    
                                }
                            });   
                        }
                    });
                    res.redirect("/toDoApp/" + req.user._id);
                }
            });
        }
    })
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
                    if(found.status=="new"){
                        Task.findByIdAndUpdate(req.params.task_id ,{"status" : "inProgress"},function(err,result){
                            if(err){
                                console.log(err)
                            }else{
                                res.redirect("/toDoApp/" + req.user._id);
                            }
                        });
                    }else{  
                        Task.findByIdAndUpdate(req.params.task_id ,{"status" : "completed"},function(err,result){
                            if(err){
                                console.log(err)
                            }else{
                                var newArchiveTask = {
                                    image : result.image,
                                    title : result.title,
                                    dueDate: result.dueDate,
                                    label: result.label , 
                                    status: "completed" ,
                                    details : result.details,
                                }
                                Archive.create(newArchiveTask, function(err, newArchive){
                                    if(err){
                                        console.log(err);
                                    } else {
                                        user.archives.push(newArchive);
                                        user.tasks.pull(result);
                                        user.save();
                                        Task.findByIdAndRemove(req.params.task_id,function(err,removedTask){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                console.log(user);    
                                            }
                                        });   
                                    }
                                });
                                res.redirect("/toDoApp/" + req.user._id);   
                            }
                        });
                    }            
                }
            })
        }
    })
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


//Middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/toDoApp/signup");
}

app.listen(3000, () => console.log(`Server is running at port 3000!!!`))