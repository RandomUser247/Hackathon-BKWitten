
const { cwd } = require("process");
const runQuery = require(cwd() + "/bin/interactormodules/runQuery.js").runQuery;




/**
 * toggles visibility of project
 * @param {int} projectid
 * @returns
 * @throws Error
 * @async
 * @name toggleProjectVisibility
 * @description
 * toggles visibility of project
 * @todo add validation
 * @todo add tests
 * @todo add documentation
 * @todo add error handling
 * @todo add logging
 */
async function adminToggleProjectVisibility(projectid) {
  const toggleProjectVisibilityQuery = `
    UPDATE projects
    SET isvisible = NOT isvisible
    WHERE id = ?
    `;
  return runQuery("run", toggleProjectVisibilityQuery, [projectid]);
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
async function adminActivateUser(id) {
  const activateUserQuery = "UPDATE users SET activated = 1 WHERE id = ?";
  return runQuery("run", activateUserQuery, [id]);
}

/**
 * gets all users
 * @returns
 * @throws Error
 * @async
 * @name getUsers
 * @description
 * gets all users
 * @todo add pagination
 * @todo add sorting
 * @todo add filtering
 * @todo add search
 * @todo add limit
 */
async function adminGetUsers() {
  const getUsersQuery = "SELECT * FROM users";
  return runQuery("all", getUsersQuery, []);
}

/**
 * gets 50 most recent media
 * @returns
 * @throws Error
 * @async
 * @name getRecentMedia
 * @description
 * gets 50 most recent media
 */
async function adminGetRecentMedia() {
  const getRecentMediaQuery =
    "SELECT * FROM media ORDER BY uploaddate DESC LIMIT 50";
  return runQuery("all", getRecentMediaQuery, []);
}


module.exports = {
    adminToggleProjectVisibility,
    adminActivateUser,
    adminGetUsers,
    adminGetRecentMedia,
};