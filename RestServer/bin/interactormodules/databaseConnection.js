const sqlite3 = require("sqlite3").verbose();
const { log, error } = require("console");
const { cwd } = require("process");
const config = require(cwd() + "/bin/config.json");
const DB_NAME = config.database.connection.dbRelativePath;
const DB_PATH = cwd() + DB_NAME;

// database instance #######################################################
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    error(err);
    return;
  }
  log("Connected to database");
});
log("Database path: " + DB_PATH);

exports.db = db;