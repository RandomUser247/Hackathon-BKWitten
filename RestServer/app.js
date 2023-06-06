var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var bcrypt = require('bcrypt');


// database instance #######################################################
var sqlite3 = require('sqlite3').verbose();



const saltround = 10;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var db = new sqlite3.Database('./bin/db/test.db');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/project', projectsRouter);
app.use('/media', mediaRouter);
app.use('/auth', authRouter);

// ressource definitions ####################################################

// default URL
app.get("/:universalURL", (req, res) =>{
    res.status(404).send("URL NOT FOUND");
})


// call to api root
app.get('/api', function(req, res) {
    console.log("api root called");
    res.send('API for the backend');
});



// server instance ######################################################

var server = app.listen(8080, function() {
    console.log("Backend Application listening at http://localhost:8080")
});

// middleware functions | access to database ###########################


// check login data
function postLogin(password, email){
    const stmt = db.prepare("SELECT email, password FROM users WHERE email=?", email);
    user = stmt.get();
    if(!user) return null;
    if(bcrypt.compare(password, user.passhash)){
        return user;
    }
    else return null;
}

// try to get project by id and return project object
function getProject(projectid){
    const stmt = db.prepare("SELECT * FROM projects WHERE ID=(?)", projectid);
    var project = stmt.get();
    return project;
}

// return all stored projects
function getProjects(){
    var projects = db.all("SELECT * FROM project");
    return projects;
}

// Insert updated projectdata in database and return success
function updateProject(projectid, project){
    const stmt = db.prepare("UPDATE projects SET \
    title=$title, description=$description, vidlink=$vidlink, moretext=$moretext, lastedit=$lastedit\
    WHERE id=$projectid",
    {
        title: project.title,
        description: project.description,
        vidlink: project.vidlink,
        moretext: project.moretext,
        lastedit: new Date().getTime(),
        projectid: projectid
    })
}

function createUser(email, password){
    db.run("INSERT INTO users VALUES (?, ?, ?)",
    null,
    email,
    encrypt(password))
}

// helper functions #########################################################

// basic encrytion
function encrypt(password){
    bcrypt
    .hash(password,saltround)
    .then(hash => {return hash})
    .catch(e => {
        console.error(e);
        return null;
    })
}

// check if password equals stored hash
function validatepass(password, hash){
    bcrypt.compare(password,hash)
    .then(res => {return true})
    .catch(e => {
        console.error(e);
        return false;
    })
}

/*
# simple express #
const express = require('express');
const app = express();
const port = process.env.PORT || port;
const www = process.env.WWW || './';
app.use(express.static(www));
console.log(`serving ${www}`);
app.get('*', (req, res) => {
    res.sendFile(`index.html`, { root: www });
});
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
*/

module.exports = app;
