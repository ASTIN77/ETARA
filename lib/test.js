const mysql = require("mysql");
dotenv = require("dotenv");
dotenv.config();

var con = mysql.createConnection({
  host: process.env.ETARADB,
  database: process.env.ETARADB_DATABASE,
  user: process.env.ETARADB_User,
  password: process.env.ETARADB_Pass,
  connectionLimit: 5,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("You are connected!");
});
con.end();
