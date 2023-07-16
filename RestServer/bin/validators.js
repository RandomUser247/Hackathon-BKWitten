const validator = require("validator");
const database = require("./db/databaseInteractor.js");
const session = require("express-session");
const { log } = require("console");


/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function validatePassword(req, res, next) {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }
  if (password.length > 50) {
    return res.status(400).json({
      message: "Password must be at most 50 characters long",
    });
  }
  next();
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function validateEmail(req, res, next) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  next();
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function validateNewPassword(req, res, next) {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters long",
    });
  }
  if (newPassword.length > 50) {
    return res.status(400).json({
      message: "New password must be at most 50 characters long",
    });
  }
  next();
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function validateCurrentPassword(req, res, next) {
  const { currentPassword } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ message: "Current password is required" });
  }
  if (currentPassword.length < 6) {
    return res.status(400).json({
      message: "Current password must be at least 6 characters long",
    });
  }
  if (currentPassword.length > 50) {
    return res.status(400).json({
      message: "Current password must be at most 50 characters long",
    });
  }
  next();
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
function validateProject(req, res, next) {
  const project = req.body;
  if (!project || !project.title || !project.description ) {
    return res.status(400).json({ message: "Invalid project" });
  }
  else{
    next();
  } 
}

/**
 *
 * @param {session.req} req
 * @param {*} res
 * @param {*} next
 * @returns
 * @description
 * This function checks if a project ID is valid.
 * A valid project ID is a number greater than 0.
 */
function validateProjectID(req, res, next) {
  const id_ = req.params.id;
  if (!id_) {
    return res.status(400).json({ message: "Project ID is required" });
  }
  if (!validator.isInt(id_, { min: 1 })) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  next();
}

module.exports = {
  validatePassword,
  validateEmail,
  validateNewPassword,
  validateCurrentPassword,
  validateProject,
  validateProjectID,
};
