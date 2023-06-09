const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database('./bin/db/test.db');
const helpers = require("../helpers.js");

const TIME = new Date();

console.log(TIME.getTime());


const usersData =[
{useremail: "admin@school.de", password: "password"},
{useremail: "Rob@school.de", password: "password"},
{useremail: "Memo@school.de", password: "password"},
{useremail: "Jonas@woboda.de", password: "password"},
{useremail: "some@dude.de", password: "wordpass"}
]

const projectData = [
    {userid: 1, title: "cool project1", description:"some text", vidlink: "", moretext: "hahahahahahha", lastedit: TIME.getTime(), creationdate: TIME.getTime()},
    {userid: 2, title: "cool project2", description:"some text", vidlink: "", moretext: "hahahahahahha", lastedit: TIME.getTime(), creationdate: TIME.getTime()},
    {userid: 3, title: "cool project3", description:"some text", vidlink: "", moretext: "hahahahahahha", lastedit: TIME.getTime(), creationdate: TIME.getTime()},
    {userid: 4, title: "cool project4", description:"some text", vidlink: "", moretext: "hahahahahahha", lastedit: TIME.getTime(), creationdate: TIME.getTime()},
    {userid: 5, title: "cool project5", description:"some text", vidlink: "", moretext: "hahahahahahha", lastedit: TIME.getTime(), creationdate: TIME.getTime()}
]




var insertUserQuery = db.prepare("Insert INTO users (email, hashpass) VALUES (?, ?)");
var insertProjectQuery = db.prepare("INSERT INTO projects (userid, title, description, vidlink, moretext, lastedit, creationdate) VALUES ($userid, $title, $description, $vidlink, $moretext, $lastedit, $creationdate)");


db.serialize(() =>{
    usersData.forEach(user => {
        var hashedPassword = helpers.encrypt(user.password);
        insertUserQuery.run(user.useremail, hashedPassword);
    });
    insertUserQuery.finalize();
    console.log("users inserted");
    projectData.forEach(project => {
        insertProjectQuery.run({$userid: project.userid,
                                $title: project.title,
                                $description: project.description,
                                $vidlink: project.vidlink,
                                $moretext: project.moretext,
                                $lastedit: project.lastedit,
                                $creationdate: project.creationdate});
    })
    insertProjectQuery.finalize();
    console.log("projects inserted");
    db.close()
})