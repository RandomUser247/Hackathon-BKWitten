const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const config = require("./bin/config");




const app = express();

// view engine setup ########################################################
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const mediaRouter = require("./routes/media");
const projectRouter = require("./routes/projects");
const authRouter = require("./routes/auth");

// app.use #################################################################
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session(config.session));

const apiRouter = express.Router();

// routes ##################################################################
apiRouter.use("/", indexRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/project", projectRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/auth", authRouter);
app.use("/api", apiRouter);

// express static files #####################################################


// server instance ######################################################

var server = app.listen(config.port, function () {
  console.log("Backend Application listening at http://localhost:8080");
});

module.exports = app;
