var express = require("express");
var router = express.Router();
var path = require("path");
var bcrypt = require("bcrypt");
var helper = require("../bin/helpers");

// database instance #######################################################
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./bin/db/test.db");
const saltround = 10;

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
    res.send("User is logged in");
    return;
  }
  // validate body
  else if (!email || !password) {
    res.status(406).send("wrong credentials");
    return;
  }
  // validate password
  else {
    postLogin(email, password)
      .then((user) => {
        if (!user) {
          res.status(406).send("Wrong credentials");
          return;
        }
        req.session.regenerate(function () {
          req.session.user = { email: user.email, userid: user.id };
          res.redirect("http://localhost:4200/");
        });
        res.send("Success");
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
 *               currentPassword:
 *                 type: string
 *                 description: Current password.
 *               newPassword:
 *                 type: string
 *                 description: New password.
 *             required:
 *               - currentPassword
 *               - newPassword
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
  const { currentPassword, newPassword } = req.body;
  // Check session
  if (!req.session.user)
    return res.status(401).json({ message: "Unauthorized" });
  // Authenticate by current password (you can replace this with your own authentication logic)
  else if (currentPassword !== req.session.user.password)
    return res.status(401).json({ message: "Invalid current password" });
  // Validate the new password (you can replace this with your own validation logic)
  else if (newPassword.length < 6)
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long" });
  // Update the user's password (you need to implement your own logic to update the password in the database)
  else {
    changePassword(req.session.userid, newPassword)
      .then((result) => {
        res.json({ message: "Password updated successfully" });
      })
      .catch((err) => {
        res.status(505).json({ message: "internal error" });
      });
  }
});

module.exports = router;

// check login data
async function postLogin(email, password) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "SELECT email, password FROM users WHERE email=?",
      email
    );
    var user = stmt.get();
    if (!user) reject("no user found");
    bcrypt
      .compare(password, user.password)
      .then((result) => {
        if (result) {
          resolve(user);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function changePassword(userId, newPassword) {
  return new Promise((resolve, reject) => {
    const updatePasswordQuery = db.prepare(
      "UPDATE users SET hashpass = ? WHERE ID = ?"
    );
    db.serialize(() => {
      updatePasswordQuery.run(newPassword, userId, function (err) {
        if (err) {
          console.error("Error updating password:", err);
          reject(err);
        } else {
          console.log("Password updated successfully");
          resolve(true);
        }
      });
    });
  });
}
