var express = require("express");
var router = express.Router();
const { getUser } = require("../bin/db/databaseInteractor");
const { checkAdmin, checkLogin } = require("../bin/middleware");

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Retrieves user data.
 *     security:
 *       - JWT: []
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       406:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
router.get("/", function (req, res) {
  const userid = req.auth.userid;
  getUser(userid)
    .then((user) => {
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      res.send({ user: user });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
