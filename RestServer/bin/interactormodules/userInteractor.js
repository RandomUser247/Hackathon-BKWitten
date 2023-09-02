const bcrypt = require("bcrypt");
const config = require("../config.json");
const saltrounds = config.database.connection.saltrounds;
const { cwd } = require("process");
const runQuery = require(cwd() + "/bin/interactormodules/runQuery.js").runQuery;

/**
 * change password of user in database
 * @param {int} userId
 * @param {string} newPassword
 * @returns
 */
async function changePassword(userId, newPassword) {
  var hash = await bcrypt.hash(newPassword, saltrounds);
  log(userId, newPassword, hash);
  const updapasswordQuery = "UPDATE users SET hashpass = ? WHERE ID = ?";
  return runQuery("run", updapasswordQuery, [hash, userId]);
}

/**
 * update last login of user in database
 * @param {int} userId
 * @returns Promise
 */
async function updateLastLogin(userId) {
  const updateLastLoginQuery = "UPDATE users SET lastlogin = ? WHERE ID = ?";
  return runQuery("run", updateLastLoginQuery, [Date.now(), userId]);
}

/**
 *  get user by email
 * @param {string} email
 * @returns
 * @example
 * {
 * ID: 1,
 * email: "some@dude.de",
 * hashpass: "Hufaehf9fabks0134sadhu",
 */
async function getUserByEmail(email) {
  const getUserbyEmailQuery = "SELECT * FROM users WHERE email = ?"; 
  return runQuery("get", getUserbyEmailQuery, [email]);
}

/**
 * get user by id
 * @param {int} id
 * @returns Promise
 */
async function getUserByID(id) {
  const getUserbyIDQuery = "SELECT * FROM users WHERE id = ?"; 
  return runQuery("get", getUserbyIDQuery, [id]);
}

/**
 *  get userID by Email
 * @param {string} email
 * @returns Promise
 * @description returns only the id of the user
 * @todo getUserByEmail should return also projectID and projectTitle
 */
async function getUserID(email) {
  const useridQuery = "SELECT id FROM users WHERE email = ?";
  return runQuery("get", useridQuery, [email]);
}

/**
 * get password of user by email
 * @param {string} email
 * @returns
 */
async function getUserPassword(email) {
  const passwordQuery = "SELECT hashpass FROM users WHERE email = ?";
  return runQuery("get", passwordQuery, [email]);
}

module.exports = {
  getUserByEmail,
  getUserID,
  getUserByID,
  getUserPassword,
  updateLastLogin,
  changePassword,
};
