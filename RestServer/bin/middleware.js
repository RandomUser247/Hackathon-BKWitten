const { log } = require("console");
const { getUserByEmail, getOwnerID } = require("./db/databaseInteractor");
const bcrypt = require("bcrypt");
const FRONTEND_URL = require("./config.json").urls.frontend;
const BACKEND_URL = require("./config.json").urls.backend;

function authenticate(req, res, next) {
  const { email, password } = req.body;
  console.log("authenticating");
  getUserByEmail(email)
    .then((user) => {
      log(user);
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
          database.updateLastLogin(user.ID);
          req.session.user = { userid: user.ID, email: user.email };
          next();
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send("Internal server error");
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal server error");
    });
}

/**
 * Saves the session
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function saveSession(req, res, next) {
  req.session.save((err) => {
    if (err) {
      res.status(500).send("Internal server error");
      return;
    }
    next();
  });
}

/**
 * Checks if the user is the owner of the project
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 * @description
 * This function checks if the user is the owner of the project.
 * If the user is the owner, the next function is called.
 * If the user is not the owner, the user is redirected to the login page.
 * This function is used in the routes for the project page.
 */
async function isOwner(req, res, next) {
  var userID = req.userid;
  var projectID = req.params.id;
  if (userID == (await getOwnerID(projectID))) {
    return next();
  }
  res.redirect(FRONTEND_URL + "/login");
}

/**
 * Checks if the user is activated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 * @description
 * This function checks if a user is activated.
 * If the user is activated, the next function is called.
 * If the user is not activated, the user is redirected to the registration page.
 * This function is used in the routes for the login and the home page.
 */
async function isactivated(req, res, next) {
    var activation = req.session.user.activated;
    if (activation == 1) {
        return next();
    }
    res.redirect(FRONTEND_URL + "/regristration");
}


/**
 *  Checks if the user is an admin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function checkAdmin(req, res, next) {
  try {
    const user = await getUserByEmail(req.session.user.email);
    if (user.isAdmin == 1) {
      next();
    } else {
      res.status(401).send("Unauthorized access");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("an internal error has occured");
  }
}

async function checkFileSize(req, res, next) {
  const { size } = req.body;
  if (size > 10000000) {
    res.status(413).send("File too large");
    return;
  }
  next();
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 * @description
 * This function checks if a user is logged in.
 */
function checkLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send("Unauthorized access");
  }
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    res.status(401).send("Already logged in");
  } else {
    next();
  }
}

// check if password equals stored hash
async function comparePasswords(req, res, next) {
  const { password, newPassword, email } = req.body;
  var row = await database.getUserPassword(email);
  if (!row) {
    res.status(406).send("Wrong credentials");
    return;
  }
  if (!(await bcrypt.compare(password, row.hashpass))) {
    res.status(406).send("Wrong credentials");
    return;
  }
  next();
}

module.exports = {
  authenticate,
  saveSession,
  isOwner,
  checkAdmin,
  checkFileSize,
  checkLogin,
  checkNotLogin,
  comparePasswords,
};
