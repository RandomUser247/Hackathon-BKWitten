const bcrypt = require("bcrypt");
const { saltrounds } = require("./config.json").database.connection;
const database = require("./db/databaseInteractor.js");
const { log, error } = require("console");

/**
 * 
 * @param {*} password 
 * @returns Promise
 * @description
 * This function encrypts a password using bcrypt
 * and returns a promise that resolves to the hash.
 */
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

/**
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 * @description
 * This function checks if the user provided a valid password
 * and if the password matches the one in the database.
 * If the password is valid, the function calls next().
 * Otherwise, it sends a 406 status code.
 */
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
