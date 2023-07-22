const mysql = require("mysql2"),
  dotenv = require("dotenv").config();

// const connection = mysql.createConnection(process.env.DATABASE_URL);
// console.log("Connection Successful");
// connection.end();

const connection = mysql.createConnection({
  host: process.env.ETARADB,
  database: process.env.ETARADB_MAIN_DATABASE,
  user: process.env.ETARADB_User,
  password: process.env.ETARADB_Pass,
  connectionLimit: 5,
});

connection.connect((err) => {
  if (!err) {
    console.log("Database is connected ...");
  } else {
    console.log("Error connecting database ...");
  }
});

const session_connection = mysql.createConnection({
  host: process.env.ETARADB,
  database: process.env.ETARADB_SESSION_DATABASE,
  user: process.env.ETARADB_User,
  password: process.env.ETARADB_Pass,
  connectionLimit: 5,
});

connection.connect((err) => {
  if (!err) {
    console.log("Database is connected ...");
  } else {
    console.log("Error connecting database ...");
  }
});

session_connection.connect((err) => {
  if (!err) {
    console.log("Database is connected ...");
  } else {
    console.log("Error connecting database ...");
  }
});

module.exports = { connection, session_connection };
