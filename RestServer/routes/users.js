var express = require("express");
var router = express.Router();
const { checkLogin } = require("../bin/validators");
const database = require("../bin/db/databaseInteractor");

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieves user data by ID.
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       406:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id(\\d)", [checkLogin], function (req, res) {
  res.status(200).send("User data retrieved successfully");  
});

module.exports = router;
