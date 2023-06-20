const bcrypt = require("bcrypt");
const saltround = 10;

const database = require("./db/databaseInteractor.js");

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
function comparePasswords(req, res, next) {
  const { password, newPassword, email } = req.body;
  bcrypt
    .compareSync(password, database.getUserPassword(email))
    .then((result) => {
      if (!result) {
        res.status(406).send("Wrong credentials");
        return;
      }
      next();
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred during login");
    });
}



module.exports = { comparePasswords, encrypt };
