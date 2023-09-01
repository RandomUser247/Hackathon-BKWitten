const bcrypt = require("bcrypt");
const { saltrounds } = require("./config.json").database.connection;
const database = require("./db/databaseInteractor.js");
const { log, error } = require("console");

// basic encrytion
function encrypt(password) {
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(password, saltrounds)
      .then((hash) => {
        resolve(hash);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

// check if password equals stored hash
async function comparePasswords(req, res, next) {
  const { password, newPassword, email } = req.body;
  var row = await database.getUserPassword(email);
  if (!row) {
    res.status(406).send("Wrong credentials");
    return;
  }
  if (!(await bcrypt.compare(password, row.hashpass))) {
    res.status(406).send("Wrong credentials");
    return;
  }
  next();
}

module.exports = { comparePasswords, encrypt };
