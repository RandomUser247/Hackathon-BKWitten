const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const { log, error } = require("console");
const run = require("./migrationv1");
const { saltround } = require("../../bin/config.json");

// database instance #######################################################
const db =
initializeDatabase();

/**
 * initialize database
 * @throws Error
 * @async 
 * @name initializeDatabase
 * @description
 * checks if database exists, if not, tries to create it
  */
async function initializeDatabase() {
  if (require("fs").existsSync("./bin/db/test.db")) {
      log("Database accessible");
    return new sqlite3.Database("./bin/db/test.db");
  } else {
      log("Database not accessible, trying to build...");
    if (await run()) {
      log("Database created!");
      return new sqlite3.Database("./bin/db/test.db");
    } else {
      error("CRITICAL: Database couldn't be accessed or created.");
      throw new Error("Database couldn't be accessed or created.");
    }
  }
}




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
  const updapasswordQuery = "UPDATE users SET hashpass = ? WHERE id = ?";
  return runQuery("run", updapasswordQuery, [
    userId,
    bcrypt.hashSync(newPassword, saltround),
  ]);
}

/**
 *  get user by email
 * @param {string} email
 * @returns
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
 *  get project of user by id
 * @param {int} userid
 * @returns Promise
 */
async function getUserProject(userid) {
  const userProjectQuery =
    "SELECT * FROM projects WHERE userid = ?";
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
  */
async function getProject(projectid) {
  const projectQuery = "SELECT * FROM projects WHERE id = ?";
  return runQuery("get", projectQuery, [projectid]);
}


/**
 * return all stored projects
 * @returns Promise
 */
async function getProjects() {
  const overviewQuery = "SELECT * FROM projects";
  return runQuery("all", overviewQuery, []);
}

/**
 * insert filepath of media into database
 * @param {string} filename 
 * @param {string} filepath 
 * @returns 
 */
async function insertMedia(filename, filepath) {
  const insertMediaQuery = "INSERT INTO media (filename, filepath) VALUES (?, ?)";
  return runQuery("run", insertMediaQuery, [filename, filepath]);
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
};
