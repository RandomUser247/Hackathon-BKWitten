const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(':memory:');


db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS projectgroup (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT, name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS media (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT, name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS credentials (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT, name TEXT)");
    db.close((e) => {console.log(e ? console.log(e) :"Database successfully closed");});
});

