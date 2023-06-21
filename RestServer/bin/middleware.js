const { log } = require("console");
const database = require("./db/databaseInteractor");
const bcrypt = require("bcrypt");

function authenticate(req, res, next) {
    const { email, password } = req.body;
    console.log("authenticating")
    database
        .getUserByEmail(email)
        .then((user) => {
            log(user)
            if (!user) {
                res.status(406).send("Wrong credentials");
                return;
            }
            bcrypt
                .compare(password, user.hashpass)   
                .then((result) => {
                    if (!result) {
                        res.status(406).send("Wrong credentials");
                        return;
                    }
                    req.session.user = { id: user.ID, email: user.email };
                    next();
                })
                .catch((err) => {
                    console.log(err)
                    res.status(500).send("Internal server error");
                });
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send("Internal server error");
        });
}

function saveSession(req, res, next) {
    req.session.save((err) => {
        if (err) {
            res.status(500).send("Internal server error");
            return;
        }
        next();
    });
}


async function isOwner(req, res, next) {
    var userID = req.userid;
    var projectID = req.params.id;
    if (userID == (await database.getOwnerID(projectID))) {
      return next();
    }
    res.redirect("http://localhost:4200/login");
  }

module.exports = { authenticate, saveSession, isOwner};