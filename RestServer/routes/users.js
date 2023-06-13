var express = require("express");
var router = express.Router();

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user data by ID
 *     description: Retrieve user data from the database based on the provided ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       406:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id(\\d)", authenticate, function (req, res) {
  // Check if the request body exists and contains the email
  if (!req.body || !req.body.email) {
    return res.status(406).send("Invalid credentials");
  }

  // Get the user ID from the request parameters
  const userId = req.params.id;

  // Retrieve user data from the database
  const userQuery =
    "SELECT u.name as name, p.projectid as projectid FROM users u INNER JOIN projects p ON u.ID = p.userid WHERE u.ID = ?";
  db.get(userQuery, [userId], function (err, row) {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    if (!row) {
      return res.status(404).send("User not found");
    }
    // Send the user data
    res.send(row);
  });
});

module.exports = router;

function createUser(email, password) {
  db.run("INSERT INTO users VALUES (?, ?, ?)", null, email, encrypt(password));
}

function authenticate(req, res, next) {
  // Check if user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
