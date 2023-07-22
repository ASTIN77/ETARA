const mysql = require("mysql2"),
  dotenv = require("dotenv");

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.ETARADB_HOST_URL,
  database: process.env.ETARADB_HOST_DATABASE,
  user: process.env.ETARADB_HOST_USERNAME,
  password: process.env.ETARADB_HOST_PASSWORD,
  connectionLimit: 5,
});

connection.connect((err) => {
  if (!err) {
    console.log("Database is connected ...");
  } else {
    console.log("Error connecting database ..." + err.message);
  }
});

module.exports = connection;
