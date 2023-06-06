var express = require('express');
var router = express.Router();



// /auth endpoint for posting login data to
app.post('/api/auth', function(req, res){
    // check session if already logged in
    
    // validate body
    var useremail = req.params.email;
    if(!useremail){
        res.status(406).send("user not found");
    }
    // validate password
    var user = postLogin(req.body.email, req.body.password);
    if(!user) res.send(406).send("wrong credentials");
    // establish session
    req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        res.redirect('http://localhost:4200/');
      });
    res.send("success");
});

// delete session (equals logout)
app.delete('/api/auth', function(req, res){
    
})

// for new password
app.put('/api/auth', function(req, res) {
    // check session

    // authentificate by current password

    // validate new password

    // update new password
})



module.exports = router;