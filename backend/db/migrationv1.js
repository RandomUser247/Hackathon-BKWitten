const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(':memory:');


db.serialize(() => {
    
    db.run("CREATE TABLE IF NOT EXISTS users (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT, email TEXT, hashpass TEXT)");

    db.run("CREATE TABLE IF NOT EXISTS projects (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT,\
        title TEXT, description TEXT, vidlink TEXT, moretext TEXT, lastedit INTEGER, creationdate INTEGER,\
        FOREIGN KEY (userid) REFERENCES users(ID))");

    db.run("CREATE TABLE IF NOT EXISTS media (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT, projectid INTEGER, data BLOB\
        FOREIGN KEY (projectid) REFERENCES projects(ID))");

    db.close((e) => {console.log(e ? console.log(e) :"Database successfully created");});
});


