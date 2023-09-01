const { cwd } = require("process");

// databaseInteractor is an aggregation of all interactormodules
// userInteractor for user related database functions
const userInteractor = require(cwd() +
  "/bin/interactormodules/userInteractor.js");
// projectInteractor for project related database functions
const projectInteractor = require(cwd() +
  "/bin/interactormodules/projectInteractor.js");
// mediaInteractor for media related database functions
const mediaInteractor = require(cwd() +
  "/bin/interactormodules/mediaInteractor.js");
// adminInteractor for admin related database functions
const adminInteractor = require(cwd() +
  "/bin/interactormodules/adminInteractor.js");

module.exports = {
  ...userInteractor,
  ...projectInteractor,
  ...mediaInteractor,
  ...adminInteractor,
};

