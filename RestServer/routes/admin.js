const router = require("express").Router();
const database = require("../bin/db/databaseInteractor");


router.get("/users", function (req, res) {
    res.status(200).json({"msg":"User data retrieved successfully"});
    }
);

router.get("/users/:id(\\d+)", function (req, res) {
    res.status(200).json({"msg":"User data retrieved successfully"});
    }
);

router.get("/logs", function (req, res) {
    res.status(200).json({"msg":"Logs retrieved successfully"});
    }
);

router.get("/media", function (req, res) {
    res.status(200).json({"msg":"Media retrieved successfully"});
    }
);

router.delete("/media/:id(\\d+)",  function (req, res) {
    res.status(200).json({"msg":"Media deleted successfully"});
    }
);

router.post("/project/:id(\\d+)", function (req, res) {
    res.status(200).json({"msg":"toggled project visibility"});
    }
);


module.exports = router;
