var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var bcrypt = require("bcrypt");
var migration = require("./bin/db/migrationv1.js");
var db;

// database instance #######################################################
var sqlite3 = require("sqlite3").verbose();
initializeDatabase();
const saltround = 10;

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var mediaRouter = require("./routes/media");
var projectRouter = require("./routes/projects");
var authRouter = require("./routes/auth");
const { log } = require("console");
const { rmSync } = require("fs");

var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "shhhh, very secret",
  })
);

const apiRouter = express.Router();

apiRouter.use("/", indexRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/project", projectRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/auth", authRouter);
app.use("/api", apiRouter);

// server instance ######################################################

var server = app.listen(8080, function () {
  console.log("Backend Application listening at http://localhost:8080");
});

module.exports = app;

async function initializeDatabase() {
  if (require("fs").existsSync("./bin/db/test.db")) {
    db = new sqlite3.Database("./bin/db/test.db");
  } else {
    console.log("Database not accessible, trying to build...");
    if (await migration.run()) {
      console.log("Database created!");
      db = new sqlite3.Database("./bin/db/test.db");
    } else {
      console.error("CRITICAL: Database couldn't be accessed or created.");
    }
  }
}
