const rfs = require("rotating-file-stream");
const path = require("path");
const morgan = require("morgan");

const currentDirectory = path.dirname(require.main.filename);

const logStream = rfs.createStream("access.log", {
  interval: "1d",
  path: path.join(currentDirectory, "log"),
});

const errorStream = rfs.createStream("error.log", {
  interval: "1d",
  path: path.join(currentDirectory, "log"),
});

const logger = morgan("combined", { stream: logStream });
const errorLogger = morgan("combined", {
  stream: errorStream,
  skip: (req, res) => res.statusCode < 400,
});
const devLogger = morgan("dev");

module.exports = { logger, errorLogger, devLogger };
