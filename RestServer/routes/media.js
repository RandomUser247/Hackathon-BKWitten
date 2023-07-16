const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
const { log } = require("console");
const { checkLogin, isOwner, isMediaOwner } = require("../bin/middleware");
const {
  insertMedia,
  getPath,
  getUserProject,
  getAllFilePathsByUserID,
  deleteFile,
  getBanner,
  insertBanner,

} = require("../bin/db/databaseInteractor");
const { v4: uuidv4 } = require("uuid");

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Define the destination folder for uploaded files
//uploads folder is in current working directory
const uploadFolder = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userfolder = path.join(
      uploadFolder,
      req.auth.userid.toString()
    );
    //create folder for user if not exists
    if (!fs.existsSync(userfolder)) {
      fs.mkdirSync(userfolder);
    }
    cb(null, userfolder);
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"), false);
    }
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const filename = uuidv4() + fileExtension;

    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const router = express.Router();



/**
 * @swagger
 * /media:
 *   put:
 *     summary: Uploads an image.
 *     tags: [Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to upload.
 *                 required: true
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Image uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 imageid:
 *                   type: integer
 *       401:
 *          description: Unauthorized.
 *       500:
 *         description: Failed to upload image or internal server error.
 */
router.put(
  "/",
  [upload.single("image")],
  async function (req, res, next) {
    // Get the uploaded file details
    const file = req.file;
    const filename = file.filename;
    const filepath = file.path;
    const project = await getUserProject(req.auth.userid);
    // Insert the file details into the database
    insertMedia(project.id, filename, filepath)
      .then((result) => {
        log("result: " + result);
        res.status(200).json({
          success: true,
          message: "Image uploaded successfully",
          imageid: result,
        });
      })
      .catch((error) => {
        console.error(error);
        // Failed to insert file into the database
        res
          .status(500)
          .json({ success: false, message: "Failed to upload image" });
      });
  }
);




/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Deletes an image.
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the image to delete.
 *         schema:
 *           type: integer
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Image deleted successfully.
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete("/:id(\\d+)", isMediaOwner, function (req, res, next) {
  const id = req.params.id;

  // Retrieve the image filepath from the database
  getPath(id).then((row) => {
    if (!row) {
      res.status(404).send("Image not found");
      return;
    }
    const filepath = row.filepath;

    // Delete the image from the file system
    fs.unlink(filepath, function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // Delete the image from the database
      deleteFile(id)
        .then((result) => {
          res.status(200).send("Image deleted successfully");
        })
        .catch((error) => {
          res.status(500).send("Internal Server Error");
          return;
        });
    });
  });
});

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Retrieves an image by ID.
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the image.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image retrieved successfully.
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:id(\\d+)", function (req, res) {
  const id = req.params.id;
  // Retrieve the image details from the database
  getPath(id)
    .then((imageDetails) => {
      if (!imageDetails) {
        res.status(404).send("Image not found");
        return;
      }
      res.sendFile(imageDetails.filepath);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

/**
 * @swagger
 * /media/banner/{id}:
 *   get:
 *     summary: Retrieves an image by ID.
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the image.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image retrieved successfully.
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/banner/:id(\\d+)", function (req, res) {
  const id = req.params.id;
  // Retrieve the image details from the database
  getBanner(id)
    .then((imageDetails) => {
      if (!imageDetails) {
        res.status(404).send("Image not found");
        return;
      }
      res.sendFile(imageDetails.filepath);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

/**
 * @swagger
 * /media/banner:
 *   put:
 *     summary: Uploads an image.
 *     tags: [Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to upload.
 *                 required: true
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Image uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               ref: '#/components/schemas/imageRespones'
 *       401:
 *          description: Unauthorized.
 *       500:
 *         description: Failed to upload image or internal server error.
 */
router.put("/banner", [upload.single("image")], async function (req, res, next) {
  // Get the uploaded file details
  const file = req.file;
  const filename = file.filename;
  const filepath = file.path;
  const project = await getUserProject(req.auth.userid);
  const oldBanner = await getBanner(project.id);
  if (oldBanner) {
    fs.unlink(oldBanner.filepath, function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }
    });
  }
  // Insert the file details into the database
  insertBanner(project.id, filename, filepath)
    .then((result) => {
      log("result: " + result);
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageid: result,
      });
    })
    .catch((error) => {
      console.error(error);
      // Failed to insert file into the database
      res
        .status(500)
        .json({ success: false, message: "Failed to upload image" });
    });
});


/**
 * @swagger
 *  /media/own:
 *   get:
 *     summary: Retrieves own images.
 *     tags: [Media]
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Image retrieved successfully.
 *         content:
 *           image/:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/own", function (req, res) {
  const userid = req.auth.userid;
  // Retrieve the image details from the database
  getAllFilePathsByUserID(userid)
    .then((imageDetails) => {
      res.json(imageDetails);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});


module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     imageRespones:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         imageid:
 *           type: integer
 */