const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Define the destination folder for uploaded files
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./bin/db/test.db");

router.use("/", express.static("./public/images"));

router.put(
  "/:id(\\d+)",
  isOwner,
  upload.single("image"),
  async function (req, res, next) {
    try {
      const file = req.file;
      // Get the uploaded file details
      const filename = `${uuidv4()}.${file.originalname.split(".").pop()}`;
      const filepath = path.join(uploadFolder, filename);

      // Insert the file details into the database
      const insertResult = await insertToDB(filename, filepath);

      if (insertResult) {
        // File inserted successfully
        res
          .status(200)
          .json({ success: true, message: "Image uploaded successfully" });
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

router.delete("/:id(\\d+)", isOwner, function (req, res, next) {
  const id = req.params.id;

  // Retrieve the image filepath from the database
  const selectQuery = "SELECT filepath FROM media WHERE id = ?";
  db.get(selectQuery, [id], function (err, row) {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

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
      const deleteQuery = "DELETE FROM media WHERE id = ?";
      db.run(deleteQuery, [id], function (err) {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
          return;
        }

        res.status(200).send("Image deleted successfully");
      });
    });
  });
});

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

async function isOwner(req, res, next) {
  var userID = req.userid;
  var projectID = req.params.id;
  if (userID == (await getOwnerID(projectID))) {
    return next();
  }
  res.redirect("http://localhost:4200/login");
}

function getOwnerID(projectID) {
  return new Promise((resolve, reject) => {
    const ownerQuery = "SELECT userid FROM projects WHERE id = ?";
    var ownerID = db.get(ownerQuery, projectID);
    if (ownerID) {
      resolve(ownerID);
    } else reject(null);
  });
}

function insertToDB(filename, filepath) {
  return new Promise((resolve, reject) => {
    const insertQuery = "INSERT INTO media (filename, filepath) VALUES (?, ?)";
    db.run(insertQuery, [filename, filepath], function (err) {
      if (err) {
        console.error(err);
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
}

function getPath(id) {
  const filePathQuery = "SELECT FROM media filename, filepath WHERE ID = ?";
  return new Promise((resolve, reject) => {
    db.run(filePathQuery, id, function (err, row) {
      if (err) {
        console.error(err);
        reject(null);
      } else if (!row) {
        reject(null);
      } else {
        resolve({ filename: row.filename, filepath: row.filepath });
      }
    });
  });
}

module.exports = router;
