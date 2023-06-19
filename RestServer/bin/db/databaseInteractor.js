var sqlite3 = require("sqlite3").verbose();
var bcrypt = require("bcrypt");
const { log } = require("console");
const run = require("./migrationv1");
const { get } = require("http");
var db = new sqlite3.Database("./bin/db/test.db");
const saltround = 10;

const passhashQuery = "SELECT hashpass FROM users WHERE email = ?";

function runQuery(func, statement, params) {
  return new Promise((resolve, reject) => {
    func(statement, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
}

//change password in database
async function changePassword(userId, newPassword) {
  const updapasswordQuery = "UPDATE users SET hashpass = ? WHERE id = ?";
  return runQuery(db.run, updapasswordQuery, [
    userId,
    bcrypt.hashSync(newPassword, saltround),
  ]);
}

async function getUserbyEmail(email) {
  const getUserbyEmailQuery = "SELECT * FROM users WHERE email = ?"; //returns all user data
  return runQuery(db.get, getUserbyEmailQuery, [email]);
}

async function getUserID(email) {
  const useridQuery = "SELECT id FROM users WHERE email = ?";
  return runQuery(db.get, useridQuery, [email]);
}

// check login data
async function postLogin(email, password) {
  const stmt = "SELECT email, hashpass FROM users WHERE email=?";
  return new Promise((resolve, reject) => {
    db.get(stmt, [email], function (err, row) {
      if (err) {
        reject(err);
        return;
      }
      if (!row) {
        console.log("no matching row found");
        resolve(null);
        return;
      } else {
        bcrypt
          .compare(password, row.hashpass)
          .then((result) => {
            if (result) {
              resolve(row);
            } else {
              resolve(null);
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  });
}

// Insert updated projectdata in database and return success
function updateProject(projectid, project) {
  const updateProjectQuery =
    "UPDATE projects SET \
                            title=$title, description=$description, vidlink=$vidlink, moretext=$moretext, lastedit=$lastedit\
                            WHERE id=$projectid";

  return runQuery(db.run, updateProjectQuery, {
    title: project.title,
    description: project.description,
    vidlink: project.vidlink,
    moretext: project.moretext,
    lastedit: new Date().getTime(),
    projectid: projectid,
  });
}

// try to get project by id and return project object
function getProject(projectid) {
  const projectQuery = "SELECT * FROM projects WHERE id = ?";
  return runQuery(db.get, projectQuery, [projectid]);
}

// return all stored projects
function getProjects() {
  const overviewQuery = "SELECT * FROM projects";
  return runQuery(db.all, overviewQuery, []);
}

function insertToDB(filename, filepath) {
  return runQuery(db.run, insertMediaQuery, [filename, filepath]);
}

function getPath(id) {
  const filePathQuery = "SELECT FROM media filename, filepath WHERE ID = ?";
  return runQuery(db.get, filePathQuery, [id]);
}

function getOwnerID(projectID) {
  const ownerQuery = "SELECT userid FROM projects WHERE id = ?";
  return runQuery(db.get, ownerQuery, [projectID]);
}

function getUserPassword(email) {
  const passwordQuery = "SELECT hashpass FROM users WHERE email = ?";
  return runQuery(db.get, passwordQuery, [email]);
}

async function getPath(id) {
  const insertMediaQuery =
    "INSERT INTO media (filename, filepath) VALUES (?, ?)";
  return runQuery(db.get, filePathQuery, [id]);
}
module.exports = {
  insertToDB,
  getProject,
  getProjects,
  changePassword,
  updateProject,
  postLogin,
  getPath,
  getOwnerID,
  getUserPassword,
  getPath,
};
