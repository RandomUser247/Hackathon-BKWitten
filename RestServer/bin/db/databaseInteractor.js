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
  return runQuery("run", updapasswordQuery, [hash, userId]);
}

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
  const getUserbyEmailQuery = "SELECT * FROM users WHERE email = ?"; //returns all user data
  return runQuery("get", getUserbyEmailQuery, [email]);
}
// TODO: getUserByEmail should return also projectID and projectTitle
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

async function toggleProjectVisibility(projectid) {
  const toggleProjectVisibilityQuery = `
  UPDATE projects
  SET isvisible = NOT isvisible
  WHERE id = ?
  `;
  return runQuery("run", toggleProjectVisibilityQuery, [projectid]);
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
                            title = $title, description = $description, vidlink = $vidlink, moretext = $moretext, lastedit = $lastedit \
                            WHERE ID = $projectid";

  return runQuery("run", updateProjectQuery, {
    $title: project.title,
    $description: project.description,
    $vidlink: project.vidlink ? project.vidlink : "no link",
    $moretext: project.moretext ? project.moretext : "no text",
    $lastedit: new Date().getTime(),
    $projectid: projectid,
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
    (SELECT GROUP_CONCAT(filename) FROM media WHERE projectid = projects.id AND isbanner = 0) AS files,
    (SELECT filename FROM media WHERE projectid = projects.id AND isbanner = 1) AS banner
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
    (SELECT filename FROM media WHERE projectid = projects.id AND isbanner = 1) AS banner
  FROM
    projects
  WHERE
    projects.isvisible = 1
`;
  return runQuery("all", overviewQuery, []);
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

/**
 * insert filepath of media into database where projectid is retrieved from projects table where userid is userid
 * @param {string} filename
 * @param {string} filepath
 * @returns
 */
async function insertMedia(projectid, filename, filepath) {
  const insertMediaQuery =
    "INSERT INTO media (projectid, filename, filepath, uploaddate) VALUES (?, ?, ?, ?) \
    RETURNING *";
  return runQuery("run", insertMediaQuery, [projectid, filename, filepath, Date.now()]);
}


//Only one banner per project
//look if banner already exists, if yes, delete old banner
async function insertBanner(projectid, filename, filepath) {
  const insertBannerQuery = `DELETE FROM media WHERE projectid = ? AND isbanner = 1;
                             INSERT INTO media (projectid, filename, filepath, uploaddate, isbanner) VALUES (?, ?, ?, ?, 1)`
  return runQuery("run", insertBannerQuery, [projectid, projectid, filename, filepath]);
}

/**
 * get filepath of media by id
 * @param {int} id
 * @returns
 */
async function getPath(id) {
  const filePathQuery = "SELECT filename, filepath FROM media WHERE ID = ?";
  return runQuery("get", filePathQuery, [id]);
}

/**
 * get all filepaths of media by userid
 * @param {int} userid
 * @returns
 * @throws Error
 * @async
 * @name getAllFilePathsByUserID
 * @description
 * get all filepaths of media by userid
  */
async function getAllFilePathsByUserID(userid) {
  const filePathQuery =
    "SELECT * FROM media WHERE projectid = ?";
  return runQuery("all", filePathQuery, [userid]);
}

async function getAllFilePathsByProjectID(projectid) {
  const filePathQuery = "SELECT filepath FROM media WHERE projectid = ?";
  return runQuery("all", filePathQuery, [projectid]);
}

async function insertBanner(projectid, filename, filepath) {
  const setBannerQuery = "INSERT INTO media (projectid, filename, filepath, uploaddate, isbanner) VALUES (?, ?, ?, ?, 1)";
  return runQuery("run", setBannerQuery, [projectid, filename, filepath, Date.now()]);
}

async function getBanner(projectid) {
  const getBannerQuery = "SELECT filename, filepath FROM media WHERE isbanner = 1 AND projectid = (SELECT id FROM projects WHERE id = ?)";
  return runQuery("get", getBannerQuery, [projectid]);
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
async function deleteMedia(id) {
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

async function getMediaOwnerID(mediaID) {
  const ownerQuery = "SELECT u.ID AS userID FROM users u \
                      JOIN projects p ON p.userid = u.ID \
                      JOIN media m ON m.projectid = p.ID \
                      WHERE m.ID = ?";
  return runQuery("get", ownerQuery, [mediaID]);
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
 * sets activate variable of user to 1
 * @param {int} id
 * @returns
 * @throws Error
 * @async
 * @name activateUser
 * @description
 * sets activate variable of user to 1
 */
async function activateUser(id) {
  const activateUserQuery = "UPDATE users SET activated = 1 WHERE id = ?";
  return runQuery("run", activateUserQuery, [id]);
}

async function getUsers() {
  const getUsersQuery = "SELECT * FROM users";
  return runQuery("all", getUsersQuery, []);
}

async function getRecentMedia() {
  const getRecentMediaQuery = "SELECT * FROM media ORDER BY uploaddate DESC LIMIT 50";
  return runQuery("all", getRecentMediaQuery, []);
}

module.exports = {
  getUserByEmail,
  getUserID,
  updateProject,
  toggleProjectVisibility,
  getProject,
  getProjects,
  getUserProject,
  getProjectsBySearch,
  getPath,
  getOwnerID,
  getUserPassword,
  activateUser,
  updateLastLogin,
  changePassword,
  insertMedia,
  deleteMedia,
  getAllFilePathsByUserID,
  getAllFilePathsByProjectID,
  getMediaOwnerID,
  insertBanner,
  getBanner,
  getUsers,
  getRecentMedia,
};
