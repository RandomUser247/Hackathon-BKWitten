const router = require("express").Router();
const { get } = require(".");
const fs = require("fs");
const path = require("path");
const {
  getUsers,
  getUserByID,
  getRecentMedia,
  toggleProjectVisibility,
  deleteMedia,
  getPath,
} = require("../bin/db/databaseInteractor");

// importing limiter for admin routes
const { adminLimiter } = require("../bin/limiters");
router.use(adminLimiter);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Retrieves all users.
 *     tags: [Admin]
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get("/users", function (req, res) {
  getUsers()
    .then((users) => {
      res
        .status(200)
        .json({ msg: "User data retrieved successfully", users: users });
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
      return;
    });
});

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Retrieves a user by ID.
 *     tags: [Admin]
 *     security:
 *       - JWT: []
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: The ID of the user.
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: User data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get("/users/:id(\\d+)", function (req, res) {
  getUserByID(req.params.id)
    .then((user) => {
      res
        .status(200)
        .json({ msg: "User data retrieved successfully", user: user });
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
      return;
    });
});

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Retrieves all logs.
 *     tags: [Admin]
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Logs retrieved successfully.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get("/logs", async function (req, res) {
  const logPath = path.join(__dirname, "../log/access.log");
  fs.readFile(logPath, "utf8", function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send(data);
  });
});

/**
 * @swagger
 * /admin/errors:
 *   get:
 *     summary: Retrieves all logs.
 *     tags: [Admin]
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Errorlogs retrieved successfully.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get("/errors", async function (req, res) {
  const errorPath = path.join(__dirname, "../log/error.log");
  fs.readFile(errorPath, "utf8", function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send(data);
  });
});

/**
 * @swagger
 * /admin/media:
 *   get:
 *     summary: Returns most recent media uploads.
 *     tags: [Admin]
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Media retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/media'
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get("/media", function (req, res) {
  getRecentMedia()
    .then((media) => {
      res
        .status(200)
        .json({ msg: "Media retrieved successfully", media });
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
      return;
    });
});

/**
 * @swagger
 * /admin/media/{id}:
 *   delete:
 *     summary: Deletes media by ID.
 *     tags: [Admin]
 *     security:
 *       - JWT: []
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: The media ID.
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: Media deleted successfully.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Media not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/media/:id(\\d+)", async function (req, res) {
  const file = await getPath(req.params.id);
  if (!file) {
    res.status(404).send("Media not found");
    return;
  }
  else{
  fs.unlink(file.filepath, (err) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
  });
  deleteMedia(req.params.id)
    .then(() => {
      res.status(200).send("Media deleted successfully");
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
      return;
    });
  }
});

/**
 * @swagger
 * /admin/project/{id}:
 *   post:
 *     summary: Toggles project visibility.
 *     tags: [Admin]
 *     security:
 *       - JWT: []
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: The ID of the user.
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully toggled.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/project/:id(\\d+)", function (req, res) {
  toggleProjectVisibility(req.params.id)
    .then(() => {
      res.status(200).send("Successfully toggled");
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
      return;
    });
});

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin routes
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *       - ID
 *       - name
 *       - email
 *       - isAdmin
 *       - lastLogin
 *       properties:
 *        id:
 *          type: integer
 *          description: The user ID.
 *        name:
 *          type: string
 *        email:
 *          type: string
 *        isAdmin:
 *          type: boolean
 *        lastLogin:
 *          type: integer
 *        example:
 *          id: 1
 *          email: admin@school.de
 *          name: admin
 *          isAdmin: true
 *          lastLogin: 1612345678
 *     media:
 *       type: object
 *       required:
 *       - ID
 *       - filepath
 *       - filename
 *       - uploadDate
 *       - isBanner
 *       properties:
 *        ID:
 *          type: integer
 *          description: The media ID.
 *        filename:
 *          type: string
 *        filepath:
 *          type: string
 *        isBanner:
 *          type: boolean
 *        uploadDate:
 *          type: integer
 *        projectID:
 *          type: integer
 *        projectTitle:
 *          type: string    
 */
