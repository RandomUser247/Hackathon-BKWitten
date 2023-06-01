// database instance #######################################################
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/db/test.db');


const saltround = 10;
const bcrypt = require('bcrypt');

// express app instance ####################################################

var express = require('express');
var app = express();

app.use(express.json);
var session = require("express-session");
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
}));

app.use(bodyParser.json({
    type: function() {
        return true;
    }
}));

// ressource definitions ####################################################

// call to api root
app.get('/api/', function(req, res) {
    res.send('API for the backend');
});

// /user endpoint
app.get('/api/user', function(req, res) {
    // authenticate request

    // get Data from Database

    // send data
    res.send('Some user Data');
});

// /auth endpoint for posting login data to
app.post('/api/auth', function(req, res){
    // check session if already logged in

    // validate body
    if (!req.accepts("application/json")){
        res.status(406).send()
    }
    // validate password

    // establish session
    res.send("success");
});

// delete session (equals logout)
app.delete('/api/auth', function(req, res){
    
})

// for new password
app.post('/api/auth', function(req, res) {
    // check session

    // authentificate by current password

    // validate new password

    // update new password
})


// project endpoint
// get sends back project data responding to id
app.get("/api/project/:id", function(req, res){
    // validate parameter
    var _id = parseInt(req.params.id);
    if (_id == NaN || _id < 0){
        res.status(404).send("BAD REQUEST");
        return;
    }

    // get project data
    var project = getProject(_id)
    if(project == null){
        res.status(404).send("project not found")
    }
    // send project data
    res.status(200).send(project)
});

// POST project updates data in project
app.post("/api/project/:id", function(req, res){
    // validate id
    var _id = parseInt(req.params.id);
    if (_id == NaN || _id < 0){
        res.status(404).send("BAD REQUEST");
        return;
    }
    // validate body data
    var params = req.body;
    var paramlist = [];
    var err = "";
    if(params.title){
        if(params.title.trim().length < 5){
            err += "you need a title at least 5 characters long \n"
            res.status(406).send(err);
            
        }

    }
    // insert data to project table row
    const stmt = db.prepare("UPSERT ")
    // send sucess response
});

// /overview endpoint, sends back all project data in a list
app.get("/api/overview", function(req, res){
    // get all project as list
    const stmt = db.prepare("SELECT * from projects");
    // respond with all projects
    res.send(stmt.run());
})

// server instance ######################################################

var server = app.listen(8080, function() {
    console.log("Backend Application listening at http://localhost:8080")
});

// middleware functions | access to database ###########################


// check login data
function postLogin(password, email){
    const stmt = db.prepare()
}

// try to get project by id and return project object
function getProject(projectid){
    const stmt = db.prepare("SELECT * FROM projects WHERE ID=(?)");
    stmt.finalize(projectid);
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
    const stmt = db.prepare("INSERT INTO projects ")
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