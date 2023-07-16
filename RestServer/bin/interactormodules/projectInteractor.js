
const { cwd } = require("process");
const runQuery = require(cwd() + "/bin/interactormodules/runQuery.js").runQuery;

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
 * get owner id of project by id
 * @param {int} projectID
 * @returns
 */
async function getOwnerID(projectID) {
  const ownerQuery = "SELECT userid FROM projects WHERE id = ?";
  return runQuery("get", ownerQuery, [projectID]);
}

module.exports = {
    getUserProject,
    updateProject,
    getProject,
    getProjects,
    getProjectsBySearch,
    getOwnerID
};