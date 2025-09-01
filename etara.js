// --- ETARA (Node 22 + Mongoose 8 + Mongo-backed sessions) ---

// 1) Load env first
require('dotenv').config();

// 2) Core deps
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// 3) Security & utilities
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

// 4) Sessions & auth
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// 5) Models & routes
const User = require('./models/user');
const indexRoutes = require('./routes/index');
const ticketRoutes = require('./routes/tickets');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/uploads');
const reportRoutes = require('./routes/reports');
const mprnRoutes = require('./routes/mprns');

// --- App config ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const PORT = Number(process.env.PORT) || 3005;
app.set('port', PORT);

// Static + body parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
app.use(cookieParser('OnlyAmigaMakesItPossible'));

// Helmet (modern usage; old helpers are deprecated)
app.use(
  helmet({
    // You can tune CSP later if you want stricter policies
    contentSecurityPolicy: false,
  })
);

// --- Mongo connection (Mongoose 8 style) ---
const MONGO_URI =
  process.env.ETARADATABASEURL;

if (!MONGO_URI) {
  throw new Error('No MongoDB connection string found. Set ETARADATABASEURL or MONGO_URI in .env');
}

async function connectDB() {
  await mongoose.connect(MONGO_URI); // no legacy flags in Mongoose 8
  console.log('✅ Mongo connected (ETARA)');
}

// --- Session store (Mongo, not in-memory) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'IrnBru32Phenomonal',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // TLS terminates at Cloudflare/NGINX; Node sees HTTP, so keep false.
      secure: false,
    },
  })
);

// --- Passport ---
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- Flash messages (after session)
const flash = require('connect-flash');
app.use(flash());

// --- Template locals ---
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.confirm = req.flash('confirm');
  next();
});

// --- Routes ---
app.use(indexRoutes);
app.use('/tickets', ticketRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/reports', reportRoutes);
app.use('/mprns', mprnRoutes);

// --- Boot ---
connectDB()
  .then(() => {
    app.listen(app.get('port'), () => {
      console.log(`🚀 ETARA listening on ${app.get('port')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });

