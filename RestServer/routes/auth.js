var express = require("express");
var router = express.Router();
var path = require("path");
var bcrypt = require("bcrypt");
var helpers = require("../bin/helpers");
var database = require("../bin/db/databaseInteractor");

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
        req.session.user = {id: user.id, email: user.email, name: user.name};
        req.session.save();
        // redirect to home page
        res.redirect("localhost:4200/overview");
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

  try {
    // Check session
    if (!req.session.user)
      return res.status(401).json({ message: "Unauthorized" });
    else if (req.session.user.email != email)
      return res.status(401).json({ message: "Invalid Email" });

    // Authenticate by current password
    const hashpass = await database.getUserPassword(req.session.user.email);
    if(!hashpass){
      return res.status(404).json({message: "User not found"})
    }
    const isValidPassword = await helpers.validatepass(
      currentPassword,
      hashpass
    );
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid current password" });

    // Validate the new password
    if (newPassword.length < 6)
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });

    // Update the user's password
    await database.changePassword(req.session.userid, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
