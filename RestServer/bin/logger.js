const rfs = require("rotating-file-stream");
const path = require("path");
const morgan = require("morgan");

const currentDirectory = path.dirname(require.main.filename);


// documentation:
// https://www.npmjs.com/package/rotating-file-stream
// https://www.npmjs.com/package/morgan

// create a rotating write stream
// interval: how often to rotate the log
// path: where to store the log files 
const logStream = rfs.createStream("access.log", {
  interval: "1d",
  path: path.join(currentDirectory, "log"),
});

const errorStream = rfs.createStream("error.log", {
  interval: "1d",
  path: path.join(currentDirectory, "log"),
});


// logger: log all requests
// errorLogger: log only errors
// devLogger: log only in development mode
const logger = morgan("combined", { stream: logStream });

const errorLogger = morgan("combined", {
  stream: errorStream,
  skip: (req, res) => res.statusCode < 400,
});

const devLogger = morgan("dev");

module.exports = { logger, errorLogger, devLogger };
