const bcrypt = require("bcrypt");
const saltround = 10;

// basic encrytion
function encrypt(password) {
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(password, saltround)
      .then((hash) => {
        resolve(hash);
      })
      .catch((e) => {
        reject(error);
      });
  });
}

// check if password equals stored hash
function validatepass(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(password, hash)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function checklogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send("Unauthorized access");
  }
}

module.exports = { validatepass, checklogin, encrypt };
