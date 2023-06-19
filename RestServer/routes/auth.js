var express = require("express");
var router = express.Router();
var path = require("path");
var bcrypt = require("bcrypt");
var helpers = require("../bin/helpers");
var database = require("../bin/db/databaseInteractor");
const { log } = require("console");

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address.
 *         password:
 *           type: string
 *           description: The user's password.
 *       required:
 *         - email
 *         - password
 */
/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Authenticates user and logs in.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login. User is redirected to the home page.
 *       406:
 *         description: Wrong credentials provided.
 *       500:
 *         description: An error occurred during login.
 */
router.post("/", async function (req, res) {
  const { email, password } = req.body;
  // check session if already logged in

  if (req.session.user) {
    res.status(200).send("Already logged in");
    return;
  }
  // validate body
  else if (!email || !password) {
    res.status(406).send("wrong credentials");
    return;
  }
  // validate password
  else {
    database
      .postLogin(email.toLowerCase(), password)
      .then((user) => {
        if (!user) {
          res.status(406).send("Wrong credentials");
          return;
        }
        // set session
        log(user)
        req.session.user = { id: user.ID, email: user.email};
        req.session.save(function (err) {
          if (err) {
            console.error(err);
            res.status(500).send("An error occurred during login");
            return;
          }
          res.status(200).send("Login successful");
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("An error occurred during login");
      });
  }
});

/**
 * @swagger
 * /auth:
 *   delete:
 *     summary: Logs out the user and destroys the session.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful. Session destroyed.
 */
router.delete("/", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("ERROR destroying session: ", err);
    }
    req.session = null;
    res.send("Logout sucessfull");
  });
});

/**
 * @swagger
 * /auth:
 *   put:
 *     summary: Update user's password.
 *     tags: [Authentication]
 *     requestBody:
 *       description: User's current and new password.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                  type: string
 *                  description: user email for verification purposes
 *               currentPassword:
 *                 type: string
 *                 description: Current password.
 *               newPassword:
 *                 type: string
 *                 description: New password.
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - email
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Invalid request or new password is too short.
 *       401:
 *         description: Unauthorized or invalid current password.
 *       500:
 *         description: Internal server error occurred.
 */
router.put("/", async function (req, res) {
  // Get the user's current password and new password from the request body
  const { currentPassword, newPassword, email } = req.body;
  log(req.session.user);
  try {
    // Check session
    if (!req.session.user){
      console.log("Unauthorized", req.session.user);
      return res.status(401).json({ message: "Unauthorized" });
    }
    else if (req.session.user.email != email)
      return res.status(401).json({ message: "Invalid Email" });

    // Authenticate by current password
    const hashpass = await database.getUserPassword(req.session.user.email);
    if (!hashpass) {
      return res.status(404).json({ message: "User not found" });
    }
    helpers
      .validatepass(currentPassword, hashpass)
      .then((valid) => {
        if (!valid) {
          return res.status(401).json({ message: "Invalid current password" });
        }
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ message: "Internal error" });
      });
    // Validate the new password
    if (newPassword.length < 6)
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    if (newPassword.length > 50)
      return res.status(400).json({
        message: "New password must be at most 50 characters long",
      });
    database
      .changePassword(req.session.user.id, newPassword)
      .then(() => {
        return res
          .status(200)
          .json({ message: "Password updated successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ message: "Internal error" });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
