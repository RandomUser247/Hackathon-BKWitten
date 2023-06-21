const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Define the destination folder for uploaded files
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
var database = require("../bin/db/databaseInteractor");
const { isOwner } = require("../bin/middleware");
const { uploadFolder } = require("../bin/config");


/**
 * @swagger
 * /media:
 *   put:
 *     summary: Uploads an image.
 *     tags: [Media]
 *     parameters:
 *       - in: formData
 *         name: image
 *         required: true
 *         description: The image file to upload.
 *         type: file
 *     security:
 *       - BearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.put(
  "/",
  isOwner,
  upload.single("image"),
  async function (req, res, next) {
    try {
      const file = req.file;

      // Get the uploaded file details
      const filename = `${uuidv4()}.${file.originalname.split(".").pop()}`;
      const filepath = path.join(uploadFolder, filename);

      // Insert the file details into the database
      const insertResult = await database.insertToDB(filename, filepath);

      if (insertResult) {
        // File inserted successfully
        res.status(200).json({
          success: true,
          message: "Image uploaded successfully",
          imageid: insertResult.id,
        });
      } else {
        // Failed to insert file into the database
        res
          .status(500)
          .json({ success: false, message: "Failed to upload image" });
      }
    } catch (error) {
      // Handle any errors that occur during the upload process
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred during image upload",
      });
    }
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
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Image deleted successfully.
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete("/:id(\\d+)", isOwner, function (req, res, next) {
  const id = req.params.id;

  // Retrieve the image filepath from the database
  database.getPath(id).then((row) => {
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
      database
        .deleteFile(id)
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
  database
    .getPath(id)
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
 *  /media/own:
 *   get:
 *     summary: Retrieves an image by ID.
 *     tags: [Media]
 *     security:
 *       - BearerAuth: []
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
  const id = req.session.user.id;
  // Retrieve the image details from the database
  database
    .getPath(id)
    .then((imageDetails) => {
      res.send({ imageDetails });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
