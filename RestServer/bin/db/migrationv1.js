const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database('./bin/db/test.db');


db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, email VARCHAR(50), hashpass TEXT)");
    console.log("USER TABLE CREATED");
    db.run("CREATE TABLE IF NOT EXISTS projects (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL,\
        userid INTEGER, title VARCHAR(50), description TEXT, vidlink VARCHAR(255), moretext TEXT, lastedit INTEGER, creationdate INTEGER,\
        FOREIGN KEY(userid) REFERENCES users(ID))");
    console.log("USER TABLE CREATED");
    db.run("CREATE TABLE IF NOT EXISTS media (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT NOT NULL, projectid INTEGER, data BLOB, isbanner boolean,\
        FOREIGN KEY(projectid) REFERENCES projects(ID))");
    console.log("MEDIA TABLE CREATED");
    db.close((e) => {console.log(e ? console.log(e) :"Database successfully created");});
});


