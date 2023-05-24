const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(':memory:');


db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS project (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT,\
         userid INTEGER, title TEXT, description TEXT, vidlink TEXT, moretext TEXT, lastedit INTEGER, creationdate INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS media (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT, projectid INTEGER, data BLOB)");
    db.run("CREATE TABLE IF NOT EXISTS user (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT, email TEXT, hashpass TEXT)");
    db.close((e) => {console.log(e ? console.log(e) :"Database successfully closed");});
});

// TODO add table constraints (foreign keys)
