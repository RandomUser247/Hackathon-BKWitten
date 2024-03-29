const { log, info } = require("console");
const jwt = require("jsonwebtoken");
const {
  getUserByEmail,
  getOwnerID,
  updateLastLogin,
  getUserPassword,
  getMediaOwnerID
} = require("./db/databaseInteractor");
const bcrypt = require("bcrypt");
const JWT_SECRET = require("./config.json").jwt_secret;
const FRONTEND_URL = require("./config.json").urls.frontend;
const BACKEND_URL = require("./config.json").urls.backend;


// documentation:
// https://www.npmjs.com/package/express-jwt
// https://www.npmjs.com/package/jsonwebtoken
// https://www.npmjs.com/package/cookie-parser
// https://www.npmjs.com/package/cors
// https://www.npmjs.com/package/bcrypt
// https://www.npmjs.com/package/express-session

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 * @throws
 * @description
 * This function checks if the user provided a valid email and password pair.
 * If not, it sends a 406 status code.
 * If yes, it calls the next function and adds the user token to the request.
 * This function is used in the routes for the login page.
 */
async function authenticate(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.hashpass))) {
      res.status(406).send('Wrong credentials');
      return;
    }

    await updateLastLogin(user.ID);

    const token = jwt.sign(
      { userid: user.ID, email: user.email, admin: user.isadmin },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Authentification error');
  }
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
  var userID = req.auth.userid;
  var projectID = req.params.id;

  getOwnerID(projectID).then((row) => {
    if (!row) {
      res.redirect(FRONTEND_URL + "/login");
    }
    else if (userID == row["userid"]) {
      log("User is owner");
      next();
    } else {
      res.redirect(FRONTEND_URL + "/login");
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send("Internal server error");
  });
}

/**
 * Checks if the user is the owner of the media
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 * @description
 * This function checks if the user is the owner of the media.
 * If the user is the owner, the next function is called.
 * If the user is not the owner, the user is redirected to the login page.
 * This function is used in the routes for the media page.
 */
async function isMediaOwner(req, res, next) {
  var userID = req.auth.userid;
  var mediaID = req.params.id;
  
  getMediaOwnerID(mediaID).then((row) => {
    if (!row) {
      res.status(404).send("Image not found");
    }
    else if (userID == row["userID"]) {
      log("User is owner");
      next();
    } else {
      res.redirect(FRONTEND_URL + "/login");
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send("Internal server error");
  });
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
  var activation = req.auth.activated;
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
    const token = req.auth;
    if (token.admin == 1) {
      next();
    }
    else {
      res.status(403).send("Forbidden");
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
  info("Checking if user is logged in");
  if (req.user) {
    next();
  } else {
    res.status(401).send("Unauthorized access");
  }
}

function checkNotLogin(req, res, next) {
  if (req.cookies.token) {
    res.status(401).send("Already logged in");
  } else {
    next();
  }
}

// check if password equals stored hash
async function comparePasswords(req, res, next) {
  const { password, newPassword, email } = req.body;
  var row = await getUserPassword(email);
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
  isMediaOwner
};
