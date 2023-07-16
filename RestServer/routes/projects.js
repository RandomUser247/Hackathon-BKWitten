var express = require("express");
var router = express.Router();
var database = require("../bin/db/databaseInteractor");
const { checkAdmin, checkLogin, isOwner } = require("../bin/middleware");
const val = require("../bin/validators");

// project endpoint
router.options("/:id\\d+", function (req, res) {
  res.header("Allow", "GET,POST,OPTIONS");
  res.status(200).send();
});

/**
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
router.get("/:id(\\d+)", [val.validateProjectID], async function (req, res) {
  try {
    // get project id
    var _id = req.params.id;
    // get project data
    var project = await database.getProject(_id);
    if (!project) {
      res.status(404).send("project not found");
    }
    // send project data
    else res.send({ project: project });
  } catch (err) {
    console.error(err);
    res.status(500).send("an internal error has occured");
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 
 * @swagger
 * /project/{id}:
 *   post:
 *     summary: Updates a project by ID.
 *     tags: [Project]
 *     security:
 *       - JWT: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Project data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *       401:
 *         description: Unauthorized access.
 *       404:
 *         description: Bad request or project not found.
 *       406:
 *         description: Invalid input or validation error.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/:id",
  [val.validateProjectID, val.validateProject, isOwner],
  async function (req, res) {
    // validate body data
    var params = req.body;
    var err = "";
    console.log("initiating project update");
    database
      .updateProject(req.params.id, req.body)
      .then((result) => {
        console.log("successful project update");
        res.send("SUCCESS");
      })
      .catch((err) => {
        res.status(500).send("internal error occured");
      });
  }
);

router.options("/overview", function (req, res) {
  res.header("Allow", "GET,OPTIONS");
  res.status(200).send();
});

/**
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
  database
    .getProjects()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.status(500).send("An internal error occured");
    });
});

router.options("/search/:search", function (req, res) {
  res.header("Allow", "GET,OPTIONS");
  res.status(200).send();
});

// project search endpoint
/**
 * @swagger
 * /project/search/{search}:
 *   get:
 *     summary: Retrieves project list by search.
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: search
 *         required: true
 *         description: The search term.
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns the project list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectList'
 *       500:
 *         description: Internal server error.
 */
router.get("/search/:search", async function (req, res) {
  database
    .getProjectsBySearch(req.params.search)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.status(500).send("An internal error occured");
    });
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *         userid:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         vidlink:
 *           type: string
 *         moretext:
 *           type: string
 *         lastedit:
 *           type: integer
 *         creationdate:
 *           type: integer
 *     ProjectInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         vidlink:
 *           type: string
 *         moretext:
 *           type: string
 *
 *     ProjectList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Project'
 */
