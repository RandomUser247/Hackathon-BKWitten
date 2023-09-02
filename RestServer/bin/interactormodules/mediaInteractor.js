const { cwd } = require("process");
const runQuery = require(cwd() + "/bin/interactormodules/runQuery.js").runQuery;

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
  const filePathQuery = "SELECT filename FROM media WHERE projectid = ?";
  return runQuery("all", filePathQuery, [userid]);
}

/**
 * get all filepaths of media by projectid
 * @param {int} projectid
 * @returns
 * @throws Error
 * @async
 * @name getAllFilePathsByProjectID
 * @description
 * get all filepaths of media by projectid
 */
async function getAllFilePathsByProjectID(projectid) {
  const filePathQuery = "SELECT filename FROM media WHERE projectid = ?";
  return runQuery("all", filePathQuery, [projectid]);
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
 * insert filepath of media into database where projectid is retrieved from projects table where userid is userid
 * @param {string} filename
 * @param {string} filepath
 * @returns
 */
async function insertMedia(projectid, filename, filepath) {
  const insertMediaQuery =
    "INSERT INTO media (projectid, filename, filepath, uploaddate) VALUES (?, ?, ?, ?) \
        RETURNING *";
  return runQuery("run", insertMediaQuery, [
    projectid,
    filename,
    filepath,
    Date.now(),
  ]);
}

/**
 * insert filepath of banner into database where projectid is retrieved from projects table where userid is userid
 * @param {int} projectid
 * @param {string} filename
 * @param {string} filepath
 * @returns
 * @throws Error
 * @async
 * @name insertBanner
 * @description
 * insert filepath of banner into database where projectid is retrieved from projects table where userid is userid
 * @todo add validation
 * @todo add tests
 */
async function insertBanner(projectid, filename, filepath) {
  const insertBannerQuery = `DELETE FROM media WHERE projectid = ? AND isbanner = 1;
                                 INSERT INTO media (projectid, filename, filepath, uploaddate, isbanner) VALUES (?, ?, ?, ?, 1)`;
  return runQuery("run", insertBannerQuery, [
    projectid,
    projectid,
    filename,
    filepath,
    Date.now(),
  ]);
}

/**
 * get banner of project by projectid
 * @param {int} projectid
 * @returns
 * @throws Error
 * @async
 * @name getBanner
 * @description
 * get banner of project by projectid
 */
async function getBanner(projectid) {
  const getBannerQuery =
    "SELECT filename, filepath FROM media WHERE isbanner = 1 AND projectid = (SELECT id FROM projects WHERE id = ?)";
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
 * get userid by mediaid
 * @param {int} mediaID
 * @returns
 * @throws Error
 * @async
 * @name getMediaOwnerID
 * @description
 * get userid by mediaid
 */
async function getMediaOwnerID(mediaID) {
  const ownerQuery =
    "SELECT u.ID AS userID FROM users u \
                        JOIN projects p ON p.userid = u.ID \
                        JOIN media m ON m.projectid = p.ID \
                        WHERE m.ID = ?";
  return runQuery("get", ownerQuery, [mediaID]);
}

module.exports = {
  getAllFilePathsByUserID,
  getAllFilePathsByProjectID,
  insertBanner,
  getBanner,
  deleteMedia,
  getMediaOwnerID,
  insertMedia,
  getPath,
};
