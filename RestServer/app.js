var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const config = require("./bin/config");

const specs = swaggerJsDoc(config.swaggerOptions);

var app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var mediaRouter = require("./routes/media");
var projectRouter = require("./routes/projects");
var authRouter = require("./routes/auth");

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
app.use(express.static(path.join(__dirname, "public/images")));

// server instance ######################################################

var server = app.listen(config.port, function () {
  console.log("Backend Application listening at http://localhost:8080");
});

module.exports = app;
