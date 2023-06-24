var express = require("express");
var router = express.Router();
var path = require("path");
var bcrypt = require("bcrypt");
var helpers = require("../bin/helpers");
var database = require("../bin/db/databaseInteractor");
const { log } = require("console");
const {
  validateEmail,
  validatePassword,
  validateCurrentPassword,
  validateNewPassword,
} = require("../bin/validators");
const {
  authenticate,
  saveSession,
  checkLogin,
  checkNotLogin,
  comparePasswords,
} = require("../bin/middleware");

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
 *       400:
 *         description: Invalid request. Missing email or password.
 *       401:
 *         description: Unauthorized. Wrong credentials provided.
 *       406:
 *         description: Wrong credentials provided.
 *       500:
 *         description: An error occurred during login.
 */
router.post(
  "/",
  [
    checkNotLogin,
    validateEmail,
    validatePassword,
    authenticate,
    saveSession,
  ],
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
      return res.status(500).json({ message: "Internal error" });
    }
    req.session = null;
    return res.status(200).json({ message: "Logout successful" });
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
 *            $ref: '#/components/schemas/ChangePasswordRequest'
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
    checkLogin,
    validateEmail,
    validatePassword,
    comparePasswords,
  ],
  async function (req, res) {
    // Get the user's current password and new password from the request body
    const { password, newPassword, email } = req.body;
    log(req.session.user);
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

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePasswordRequest:
 *       type: object
 *       properties:
 *         email:
 *            type: string
 *            description: user email for verification purposes
 *         password:
 *           type: string
 *           description: Current password.
 *         newPassword:
 *           type: string
 *           description: New password.
 *       required:
 *         - password
 *         - newPassword
 *         - email
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
module.exports = router;
