const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const { log, error } = require("console");
const run = require("./migrationv1");
const { cwd } = require("process");
const config = require(cwd() + "/bin/config.json");
const fs = require("fs").promises;

const DB_NAME = config.database.connection.dbRelativePath;
const DB_PATH = cwd() + DB_NAME;
const saltrounds = config.database.connection.saltrounds;

// database instance #######################################################
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    error(err);
    return;
  }
  log("Connected to database");
});
log("Database path: " + DB_PATH);

/**
 * wrapper function to run a query and return the result
 * @param {string} func
 * @param {sqlQueryString} statement
 * @param {[*]} params
 * @returns
 */
async function runQuery(func, statement, params) {
  try {
    return await runQueryPromise(func, statement, params);
  } catch (error) {
    log(error);
  }
}

/**
 * generic function to run a query and return the promise
 * @param {string} func
 * @param {sqlQueryString} statement
 * @param {{*}} params
 * @returns Promise
 */
async function runQueryPromise(func, statement, params) {
  return new Promise((resolve, reject) => {
    if (!["run", "get", "all"].includes(func)) {
      const error = new Error("Invalid SQLite3 function.");
      log(error);
      reject(error);
      return;
    }
    db[func](statement, params, function (err, result) {
      if (err) {
        log(err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

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
  return runQuery("run", updapasswordQuery, [
    hash,
    userId,
  ]);
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
  const getUserbyEmailQuery = "SELECT * FROM users WHERE email = ?"; //returns all user data
  return runQuery("get", getUserbyEmailQuery, [email]);
}

/**
 *  get userID by Email
 * @param {string} email
 * @returns Promise
 */
async function getUserID(email) {
  const useridQuery = "SELECT id FROM users WHERE email = ?";
  return runQuery("get", useridQuery, [email]);
}

/**
 *  get project and a list of all media filepaths of user by id
 * @param {int} userid
 * @returns Promise with project and media filepaths
 * @example
 * {
 * id: 1,
 * title: "test",
 * description: "test",
 * vidlink: "test",
 * moretext: "test",
 * lastedit: 1620230400000,
 * creationdate: 1620230400000,
 * files: "test/test.jpg,test/test2.jpg"
 * }
 */
async function getUserProject(userid) {
  const userProjectQuery = `
  SELECT
    projects.id AS id,
    projects.title AS title,
    projects.description AS description,
    projects.vidlink AS vidlink,
    projects.moretext AS moretext,
    projects.lastedit AS lastedit,
    projects.creationdate AS creationdate,
    (SELECT GROUP_CONCAT(filename, filepath) FROM media WHERE projectid = projects.id) AS files
  FROM
    projects
  WHERE
    projects.userid = ?
`;
  return runQuery("get", userProjectQuery, [userid]);
}

/**
 *Insert updated projectdata in database and return success
 * @param {int} projectid
 * @param   {object} project
 * @returns Promise
 */
async function updateProject(projectid, project) {
  const updateProjectQuery =
    "UPDATE projects SET \
                            title=$title, description=$description, vidlink=$vidlink, moretext=$moretext, lastedit=$lastedit\
                            WHERE id=$projectid";

  return runQuery("run", updateProjectQuery, {
    title: project.title,
    description: project.description,
    vidlink: project.vidlink,
    moretext: project.moretext,
    lastedit: new Date().getTime(),
    projectid: projectid,
  });
}

/**
 * try to get project by id and return project object
 * @param {int} projectid
 * @returns Promise
 * @throws Error
 * @example
 * {
 * id: 1,
 * title: "test",
 * description: "test",
 * vidlink: "test",
 * moretext: "test",
 * lastedit: 1620230400000,
 * creationdate: 1620230400000,
 * files: "test/test.jpg,test/test2.jpg"
 * }
 */
async function getProject(projectid) {
  const projectQuery = `
  SELECT
    projects.id AS id,
    projects.title AS title,
    projects.description AS description,
    projects.vidlink AS vidlink,
    projects.moretext AS moretext,
    projects.lastedit AS lastedit,
    projects.creationdate AS creationdate,
    (SELECT GROUP_CONCAT(filename, filepath) FROM media WHERE projectid = projects.id) AS files
  FROM
    projects
  WHERE
    projects.id = ?
`;
  return runQuery("get", projectQuery, [projectid]);
}

/**
 * return all stored projects
 * @returns Promise
 */
async function getProjects() {
  const overviewQuery = `
  SELECT
    projects.id AS id,
    projects.title AS title,
    projects.description AS description,
    projects.vidlink AS vidlink,
    projects.moretext AS moretext,
    projects.lastedit AS lastedit,
    projects.creationdate AS creationdate,
    (SELECT GROUP_CONCAT(filename, filepath) FROM media WHERE projectid = projects.id AND isbanner = 1) AS files
  FROM
    projects
`;
  return runQuery("all", overviewQuery, []);
}

/**
 * insert filepath of media into database
 * @param {string} filename
 * @param {string} filepath
 * @returns
 */
async function insertMedia(projectid, filename, filepath) {
  const insertMediaQuery =
    "INSERT INTO media (projectid, filename, filepath) VALUES (?, ?, ?)";
  return runQuery("run", insertMediaQuery, [projectid, filename, filepath]);
}

async function insertBanner(projectid, filename, filepath) {
  const insertBannerQuery = `INSERT INTO media (projectid, filename, filepath, isbanner) VALUES ($projectid, $filename, $filepath, 1);
  UPDATE projects SET bannerid = (SELECT id FROM media WHERE projectid = $projectid AND filename = $filename AND filepath = $) WHERE id = ?;
  `;
  return runQuery("run", insertBannerQuery, [projectid, filename, filepath]);
}

/**
 * get filepath of media by id
 * @param {int} id
 * @returns
 */
async function getPath(id) {
  const filePathQuery = "SELECT FROM media filename, filepath WHERE ID = ?";
  return runQuery("get", filePathQuery, [id]);
}

async function getAllFilePathsByUserID(userid) {
  const filePathQuery =
    "SELECT filepath, filename, isbanner FROM media JOIN projects ON media.projectid = projects.id WHERE projects.userid = ?";
  return runQuery("all", filePathQuery, [userid]);
}

async function getAllFilePathsByProjectID(projectid) {
  const filePathQuery = "SELECT filepath FROM media WHERE projectid = ?";
  return runQuery("all", filePathQuery, [projectid]);
}

async function setProjectBanner(projectid, bannerid) {
  const setBannerQuery = "UPDATE projects SET bannerid = ? WHERE id = ?";
  return runQuery("run", setBannerQuery, [bannerid, projectid]);
}

/**
 * delete media by id
 * @param {int} id
 * @returns
 * @throws Error
 * @async
 * @name deleteFile
 * @description
 * deletes media by id
 */
async function deleteFile(id) {
  const deleteFileQuery = "DELETE FROM media WHERE id = ?";
  return runQuery("run", deleteFileQuery, [id]);
}

/**
 * get owner id of project by id
 * @param {int} projectID
 * @returns
 */
async function getOwnerID(projectID) {
  const ownerQuery = "SELECT userid FROM projects WHERE id = ?";
  return runQuery("get", ownerQuery, [projectID]);
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

/**
 * get projects by search string
 * @param {string} search
 * @returns Promise
 */

async function getProjectsBySearch(search) {
  const searchQuery =
    "SELECT * FROM projects WHERE title LIKE ? OR description LIKE ?";
  return runQuery("all", searchQuery, ["%" + search + "%", "%" + search + "%"]);
}

module.exports = {
  getUserByEmail,
  getUserID,
  updateProject,
  getProject,
  getProjects,
  getPath,
  getOwnerID,
  getUserPassword,
  changePassword,
  insertMedia,
  getUserProject,
  getProjectsBySearch,
  deleteFile,
  getAllFilePathsByUserID,
  getAllFilePathsByProjectID,
  setProjectBanner,
};
