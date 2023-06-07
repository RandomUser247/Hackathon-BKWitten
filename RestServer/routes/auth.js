var express = require('express');
var router = express.Router();
var path = require('path');
var bcrypt = require('bcrypt');
var helper = require('../bin/helpers');


// database instance #######################################################
var sqlite3 = require('sqlite3').verbose();
const saltround = 10;


// /auth endpoint for posting login data to
router.post('/', function(req, res){
    const { email, password } = req.body;
    // check session if already logged in
    if(req.session.user){
        res.send('User is logged in')
        return;
    }
    // validate body
    if(!email || !password){
        res.status(406).send("wrong credentials");
        return;
    }
    // validate password
    var user = postLogin(email, password);

    if(!user) {
        res.send(406).send("wrong credentials");
        return;
    }
    // establish session
    req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = {email: user.email, id: user.id};
        res.redirect('http://localhost:4200/');
      });
    res.send("success");
});

// delete session (equals logout)
router.delete('/', function(req, res){
    req.session.destroy((err) => {
        if(err){
            console.error("ERROR destroying session: ", err)
        }
        res.send("Logout sucessfull");
    })
})

// for new password
router.put('/', function(req, res) {
    // check session

    // authentificate by current password

    // validate new password

    // update new password
})



module.exports = router;

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