var sqlite3 = require("sqlite3").verbose();
var bcrypt = require("bcrypt");
var db = new sqlite3.Database("./bin/db/test.db");
const saltround = 10;

const passhashQuery = "SELECT hashpass FROM users WHERE email = ?";
const stmt = "SELECT email, hashpass FROM users WHERE email=?";
const updatePasswordQuery = "UPDATE users SET hashpass = ? WHERE ID = ?";
const updateProjectQuery = "UPDATE projects SET \
                            title=$title, description=$description, vidlink=$vidlink, moretext=$moretext, lastedit=$lastedit\
                            WHERE id=$projectid"
const projectQuery = "SELECT * FROM projects WHERE ID = ?";
const overviewQuery = "SELECT * FROM projects";
const insertMediaQuery = "INSERT INTO media (filename, filepath) VALUES (?, ?)";
const filePathQuery = "SELECT FROM media filename, filepath WHERE ID = ?";
const ownerQuery = "SELECT userid FROM projects WHERE id = ?";
const passwordQuery = "SELECT hashpass FROM users WHERE email = ?"

//change password in database
async function changePassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(updatePasswordQuery, [newPassword, userId], function (err) {
          if (err) {
            console.error("Error updating password:", err);
            reject(err);
          } else {
            console.log("Password updated successfully");
            resolve(true);
          }
        });
      });
    });
  }



// check login data
async function postLogin(email, password) {
    return new Promise((resolve, reject) => {
      db.get(stmt, [email], function (err, row) {
        if (!row) reject("no user found");
        else {
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
    return new Promise((resolve, reject) => {
      db.run(updateProjectQuery,
        {
          title: project.title,
          description: project.description,
          vidlink: project.vidlink,
          moretext: project.moretext,
          lastedit: new Date().getTime(),
          projectid: projectid,
        },
        function(err){
            if(err){
                reject(err);
            }
            else{
                resolve(true);
            }
        }
      );
    });
  }


// try to get project by id and return project object
function getProject(projectid) {
    return new Promise((resolve, reject) => {
      db.get(
        projectQuery,
        projectid,
        function (err, row) {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            console.log("no matching row found");
            resolve(null);
            return;
          }
          console.log(row);
          resolve(row);
        }
      );
    });
  }
  
  // return all stored projects
  function getProjects() {
    return new Promise((resolve, reject) => {
      db.all(overviewQuery, function (err, rows) {
        if (err) {
          reject(err);
          return;
        }
        if (!rows) {
          console.log("no rows found");
          resolve(null);
          return;
        }
        resolve(rows);
      });
    });
  }
  

  function insertToDB(filename, filepath) {
    return new Promise((resolve, reject) => {
      db.run(insertMediaQuery, [filename, filepath], function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
  

  
function getPath(id) {
    return new Promise((resolve, reject) => {
      db.run(filePathQuery, id, function (err, row) {
        if (err) {
          console.error(err);
          reject(null);
        } else if (!row) {
          reject(null);
        } else {
          resolve({ filename: row.filename, filepath: row.filepath });
        }
      });
    });
  }

  function getOwnerID(projectID) {
    return new Promise((resolve, reject) => {
      var ownerID = db.get(ownerQuery, projectID);
      if (ownerID) {
        resolve(ownerID);
      } else reject(null);
    });
  }
  

  function getUserPassword(email){
    return new Promise((resolve, reject) =>{
        db.get(passwordQuery, [email], function(err, row){
            if(err) reject(err)
            else{
                if(!row) resolve(null)
                else resolve(row.hashpass)

            }
            
        })

    })
  }

  module.exports = {insertToDB, getProject, getProjects, changePassword, updateProject, postLogin, getPath, getOwnerID, getUserPassword}