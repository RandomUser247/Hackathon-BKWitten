// database instance #######################################################
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/db/test.db');


const saltround = 10;
const bcrypt = require('bcrypt');

// express app instance ####################################################

var express = require('express');
var app = express();

// ressource definitions ####################################################

// call to api root
app.get('/api/', function(req, res) {
    res.send('API for the backend');
});

// /user endpoint
app.get('/api/user', function(req, res) {
    res.send('API for the backend');
});

// /auth/login endpoint for posting login data to
app.post('/api/auth/login', function(req, res){

});

// project endpoint
// get sends back project data responding to id
app.get("/api/project", function(req, res){

});

// POST project updates data in project
app.post("/api/project", function(req, res){

});

// /overview endpoint, sends back all project data in a list
app.get("/api/overview", function(req, res){

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

}

// return all stored projects
function getProjects(){

}

// Insert updated projectdata in database and return success
function updateProject(projectid, project){

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