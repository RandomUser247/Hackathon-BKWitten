const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./bin/db/test.db");

async function run() {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(() => {
        db.run(
          "CREATE TABLE IF NOT EXISTS users (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, email VARCHAR(50), name VARCHAR(16) NOT NULL hashpass TEXT NOT NULL,\
          lastlogin INTEGER DEFAULT 0, isadmin INTEGER DEFAULT 0 CHECK (isadmin IN (0, 1))\
          isactivated INTEGER NOT NULL DEFAULT 0 CHECK(isactivated IN (0,1)))"
        );
        console.log("USER TABLE CREATED");
        db.run(
          "CREATE TABLE IF NOT EXISTS projects (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL,\
                    userid INTEGER, title VARCHAR(50), description TEXT, vidlink VARCHAR(255), moretext TEXT, lastedit INTEGER, creationdate INTEGER, \
                    isvisible INTEGER NOT NULL DEFAULT 1 CHECK(isvisible IN (O,1)), \
                    FOREIGN KEY(userid) REFERENCES users(ID))"
        );
        console.log("USER TABLE CREATED");
        db.run(
          "CREATE TABLE IF NOT EXISTS media (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, projectid INTEGER, filename VARCHAR(255), filepath VARCHAR(255), isbanner INTEGER DEFAULT 0 CHECK (isbanner IN (0, 1)) \
                    FOREIGN KEY(projectid) REFERENCES projects(ID))"
        );
        console.log("MEDIA TABLE CREATED");
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
