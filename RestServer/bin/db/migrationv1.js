const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./bin/db/test.db");
const { log } = require("console");
const e = require("express");

async function run() {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(() => {
        db.run(
          "CREATE TABLE IF NOT EXISTS users \
          (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, \
          email VARCHAR(50), \
          name VARCHAR(16) NOT NULL, \
          hashpass TEXT NOT NULL, \
          lastlogin INTEGER DEFAULT 0, \
          isadmin INTEGER DEFAULT 0, \
          isactivated INTEGER NOT NULL DEFAULT 0 CHECK (isactivated IN (0,1)))",
          (err) => {
            if (err) {
              log(err);
            } else log("USER TABLE CREATED");
          }
        );
        db.run(
          "CREATE TABLE IF NOT EXISTS projects \
          (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, \
                    userid INTEGER, \
                    title VARCHAR(50), \
                    description TEXT, \
                    vidlink VARCHAR(255), \
                    moretext TEXT, \
                    lastedit INTEGER, \
                    creationdate INTEGER, \
                    isvisible INTEGER NOT NULL DEFAULT 1, \
                    FOREIGN KEY(userid) REFERENCES users(ID))",
          (err) => {
            if (err) {
              log(err);
            } else log("PROJECT TABLE CREATED");
          }
        );
        db.run(
          "CREATE TABLE IF NOT EXISTS media \
                    (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, \
                    projectid INTEGER, \
                    filename VARCHAR(255), \
                    filepath VARCHAR(255), \
                    isbanner INTEGER DEFAULT 0, \
                    FOREIGN KEY(projectid) REFERENCES projects(ID))",
          (err) => {
            if (err) {
              log(err);
            } else log("MEDIA TABLE CREATED");
          }
        );
        db.close((e) => {
          console.log(e ? console.log(e) : "Database successfully created");
        });
      });
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

if (require.main === module) {
  run();
}

module.exports = run;
