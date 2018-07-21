// REQUIRED MODULES SETUP

const express             =       require('express'),
      cookieParser        =       require('cookie-parser'),
      bodyParser          =       require('body-parser'),
      mongoose            =       require('mongoose'),
      session             =       require('express-session'),
      memoryStore         =       require('session-memory-store')(session),
      expressSanitizer    =       require("express-sanitizer"),
      passport            =       require('passport'),
      LocalStrategy       =       require("passport-local").Strategy,
      methodOverride      =       require('method-override'),
      flash               =       require('connect-flash'),
      User                =       require("./models/user"),
      indexRoutes         =       require("./routes/index"),
      ticketRoutes        =       require("./routes/tickets"),
      searchRoutes        =       require("./routes/search"),
      uploadRoutes        =       require("./routes/uploads"),
      reportRoutes        =       require("./routes/reports"),
      app                 =       express();
      mongoose.Promise    =       global.Promise;


// MONGOOSE DATABASE CONNECTION SETUP

/*mongoose.connect('mongodb://adminTest:Chalmers77@ds247439.mlab.com:47439/smsdm-artta', {useNewUrlParser: true});*/
  mongoose.connect('mongodb://' + process.env.IP + ':' + '27017/smsdm', {useNewUrlParser: true});


// SETUP ENVIROMENTALS

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(cookieParser('OnlyAmigaMakesItPossible'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method")),
app.use(session({
    secret: "IrnBru32Phenomonal",
    resave: false,
    saveUninitialized: false,
    store: new memoryStore() }));
app.use(flash());
app.use(expressSanitizer());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.confirm = req.flash("confirm");
    next(); });
    
    
app.use(indexRoutes);
app.use("/tickets",ticketRoutes);
app.use("/search", searchRoutes);
app.use("/upload", uploadRoutes);
app.use("/reports", reportRoutes);
    
app.set('port', process.env.PORT);  

   
app.listen(app.get('port'), function(){
    console.log('Artta SMS Portal Successfully Started');
});