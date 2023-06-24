const router = require("express").Router();
const database = require("../bin/db/databaseInteractor");


router.get("/users", function (req, res) {
    res.status(200).send("User data retrieved successfully");
    }
);

router.delete("/media/:id(\\d+)",  function (req, res) {
    res.status(200).send("Media deleted successfully");
    }
);

router.post("/project/:id(\\d+)", function (req, res) {
    res.status(200).send("toggled project visibility");
    }
);

router.get("/logs", function (req, res) {
    res.status(200).send("Logs retrieved successfully");
    }
);

module.exports = router;