var express = require("express");
var router = express.Router();
var path = require("path");
var bcrypt = require("bcrypt");
var helpers = require("../bin/helpers");
var database = require("../bin/db/databaseInteractor");
const { log } = require("console");
const val = require("../bin/validators");
const { authenticate, saveSession} = require("../bin/middleware");

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
router.post(
  "/",
  [val.checkNotLogin, val.validateEmail, val.validatePassword, authenticate, saveSession],
  async function (req, res) {
    res.status(200).json({ message: "Login successful" });
  }
);

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
 *               password:
 *                 type: string
 *                 description: Current password.
 *               newPassword:
 *                 type: string
 *                 description: New password.
 *             required:
 *               - password
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
router.put(
  "/",
  [
    val.checklogin,
    val.validateEmail,
    val.validatePassword,
    helpers.comparePasswords,
  ],
  async function (req, res) {
    // Get the user's current password and new password from the request body
    const { password, newPassword, email } = req.body;
    try {
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
  }
);

//middleware functions for email and password validation

module.exports = router;
