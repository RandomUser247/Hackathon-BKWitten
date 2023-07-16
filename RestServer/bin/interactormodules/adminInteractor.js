
const { cwd } = require("process");
const runQuery = require(cwd() + "/bin/interactormodules/runQuery.js").runQuery;

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

async function adminGetUsers() {
  const getUsersQuery = "SELECT * FROM users";
  return runQuery("all", getUsersQuery, []);
}

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