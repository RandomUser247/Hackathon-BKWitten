var express = require("express");
var router = express.Router();
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./bin/db/test.db");

// project endpoint
/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           format: int64
 *           description: The project ID
 *         userid:
 *           type: integer
 *           format: int64
 *           description: The user ID associated with the project
 *         title:
 *           type: string
 *           description: The project title
 *         description:
 *           type: string
 *           description: The project description
 *         vidlink:
 *           type: string
 *           description: The video link associated with the project
 *         moretext:
 *           type: string
 *           description: Additional text related to the project
 *         lastedit:
 *           type: integer
 *           format: int64
 *           description: The timestamp of the last edit of the project
 *         creationdate:
 *           type: integer
 *           format: int64
 *           description: The timestamp of the project creation date
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Retrieves a project by ID.
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:id(\\d+)", async function (req, res) {
  try {
    // validate parameter
    var _id = parseInt(req.params.id);
    if (!_id || _id < 0) {
      res.status(404).send("NO SUCH PROJECT");
    }
    // get project data
    var project = await getProject(_id);
    if (!project) {
      res.status(404).send("project not found");
    }
    // send project data
    res.status(200).json({ project: project });
  } catch (err) {
    console.error(err);
    res.status(500).send("an internal error has occured");
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The project title
 *         description:
 *           type: string
 *           description: The project description
 *         vidlink:
 *           type: string
 *           description: The video link associated with the project
 *         moretext:
 *           type: string
 *           description: Additional text related to the project
 * 
 * @swagger
 * /project/{id}:
 *   post:
 *     summary: Updates a project by ID.
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project.
 *         schema:
 *           type: integer
 *       - in: body
 *         name: project
 *         required: true
 *         description: The updated project data.
 *         schema:
 *           $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *       404:
 *         description: Bad request or project not found.
 *       406:
 *         description: Invalid input or validation error.
 *       405:
 *         description: Internal server error.
 */
router.post("/:id", async function (req, res) {
  // validate id
  var _id = parseInt(req.params.id);
  if (_id == NaN || _id < 0) {
    res.status(404).send("BAD REQUEST");
    return;
  }
  // validate body data
  var params = req.body;
  var paramlist = [];
  var err = "";
  if (params.title) {
    if (params.title.trim().length < 5) {
      err += "you need a title at least 5 characters long \n";
      res.status(406).send(err);
      return;
    }
  }
  updateProject(req.params.id, req.body)
    .then((result) => {
      res.send("SUCCESS");
    })
    .catch((err) => {
      res.status(405).send("internal error occured");
    });
});
/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Project'
 * @swagger
 * /project/overview:
 *   get:
 *     summary: Retrieves project overview.
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Successful operation. Returns the project overview.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectList'
 *       500:
 *         description: Internal server error.
 */
router.get("/overview", async function (req, res) {
  getProjects()
    .then((result) => {
      res.send(projects);
    })
    .catch((err) => {
      res.status(500).send("An internal error occured");
    });
});

module.exports = router;

// try to get project by id and return project object
function getProject(projectid) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM projects WHERE ID = ?",
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
    db.all("SELECT * FROM projects", function (err, rows) {
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

// Insert updated projectdata in database and return success
function updateProject(projectid, project) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "UPDATE projects SET \
        title=$title, description=$description, vidlink=$vidlink, moretext=$moretext, lastedit=$lastedit\
        WHERE id=$projectid",
      {
        title: project.title,
        description: project.description,
        vidlink: project.vidlink,
        moretext: project.moretext,
        lastedit: new Date().getTime(),
        projectid: projectid,
      }
    );
    try {
      if (db.run(stmt)) resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}
