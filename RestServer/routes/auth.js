var express = require('express');
var router = express.Router();
var path = require('path');
var bcrypt = require('bcrypt');
var helper = require('../bin/helpers');


// database instance #######################################################
var sqlite3 = require('sqlite3').verbose();
const saltround = 10;


// /auth endpoint for posting login data to
router.post('/', async function(req, res){
    const { email, password } = req.body;
    // check session if already logged in
    if(req.session.user){
        res.send('User is logged in')
        return;
    }
    // validate body
    else if(!email || !password){
        res.status(406).send("wrong credentials");
        return;
    }
    // validate password
    else{
    var user = await postLogin(email, password);
    if(!user) {
        res.send(406).send("wrong credentials");
        return;
    }
    // establish session
    else{
    req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = {email: user.email, userid: user.id};
        res.redirect('http://localhost:4200/');
      });
    res.send("success");
    }
}
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
router.put('/', async function(req, res) {
    // Get the user's current password and new password from the request body
    const {currentPassword, newPassword} = req.body;
    // Check session
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  

  // Authenticate by current password (you can replace this with your own authentication logic)
  else if (currentPassword !== req.session.user.password) return res.status(401).json({ message: 'Invalid current password' });
  // Validate the new password (you can replace this with your own validation logic)
  else if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  // Update the user's password (you need to implement your own logic to update the password in the database)
  else if(await changePassword(req.session.userid, newPassword)){
    res.json({ message: 'Password updated successfully' });
  }
  else{
    res.status(505).json({message: "internal error"})
  }
  // Return a success message
  
})



module.exports = router;

// check login data
async function postLogin(password, email){
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("SELECT email, password FROM users WHERE email=?", email);
        var user = stmt.get();
        if(!user) reject("no user found");
        if(bcrypt.compare(password, user.passhash)){
            resolve(user);
        }
        else resolve(null);
    });
}

async function changePassword(userId, newPassword){
    return Promise((resolve, reject) => {
        const updatePasswordQuery = db.prepare('UPDATE users SET hashpass = ? WHERE ID = ?');
        db.serialize(() => {
        updatePasswordQuery.run(newPassword, userId, function(err) {
            if (err) {
            console.error('Error updating password:', err);
            reject(false);
            } else {
            console.log('Password updated successfully');
            }
        });
        updatePasswordQuery.finalize();
        db.close();
        resolve(true);
        });

    });
}