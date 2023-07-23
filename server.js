// REQUIRED MODULES SETUP

const express = require("express"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  db = require("./lib/db"),
  expressValidator = require("express-validator"),
  helmet = require("helmet"),
  memoryStore = require("session-memory-store")(session),
  expressSanitizer = require("express-sanitizer"),
  methodOverride = require("method-override"),
  flash = require("connect-flash"),
  dotenv = require("dotenv"),
  indexRoutes = require("./routes/index"),
  ticketRoutes = require("./routes/tickets"),
  searchRoutes = require("./routes/search"),
  uploadRoutes = require("./routes/uploads"),
  createError = require("http-errors"),
  reportRoutes = require("./routes/reports"),
  mprnRoutes = require("./routes/mprns");
dotenv.config();

app = express();

// SETUP ENVIROMENTALS

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method")),
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: memoryStore(),
    })
  );
app.use(flash());
app.use(express.json());
app.use(expressValidator());
app.use(expressSanitizer());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.confirm = req.flash("confirm");
  next();
});

app.use(indexRoutes);
app.use("/tickets", ticketRoutes);
app.use("/search", searchRoutes);
app.use("/upload", uploadRoutes);
app.use("/reports", reportRoutes);
app.use("/mprns", mprnRoutes);

app.set("port", process.env.PORT || 3000);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// Initialize MariaDB/MySQL Database connection
// & start listening on process.env.PORT

app.listen(app.get("port"), function () {
  console.log("Successfully listening on " + app.get("port"));
});
