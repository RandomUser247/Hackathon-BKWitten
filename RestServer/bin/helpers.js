const bcrypt = require("bcrypt");
const saltround = 10;


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


function checklogin(req, res, next){
    if(req.session.user){
        next();
    }
    else{
        res.status(401).send("Unauthorized access");
    }
}

module.exports = { validatepass, checklogin, encrypt};