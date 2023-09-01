const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const config = require("./bin/config");
const { checkAdmin } = require("./bin/middleware");

const { logger, errorLogger, devLogger } = require("./bin/logger");
const { expressjwt: jwt } = require("express-jwt");
const { jwt_secret: JWT_SECRET } = require("./bin/config.json");
const UPLOADPATH = "./uploads/";
const app = express();

// view engine setup ########################################################
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const mediaRouter = require("./routes/media");
const projectRouter = require("./routes/projects");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");

// jwt #####################################################################

// routes that do not require jwt
const unprotected = [
  "/api/",
  /^\/api\/docs\/.*$/,
  /^\/api\/project\/search\/.*$/,
  "/api/project/overview",
  /^\/api\/media\/retrieve\/.*$/,
  { url: /^\/api\/project\/\d+\/?$/, method: "GET" },
  { url: "/api/auth", method: "POST" },
  { url: "/api/media", method: "GET" },
];

// jwt middleware
const jwtCheck = jwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => {
    try {
      return req.cookies.token;
    } catch (err) {
      return null;
    }
  },
}).unless({
  path: unprotected,
});

// Logging #################################################################

app.use(logger);
app.use(errorLogger);
app.use(devLogger);

// enocoding #################################################################
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// enable cors for all routes from frontend and backend
app.use(cors({ origin: [config.urls.frontend, config.urls.backend], credentials: true }));
app.use(cookieParser());

// static routes ############################################################
app.use("/uploads", express.static(path.join(__dirname, UPLOADPATH)));
app.use("/public", express.static(path.join(__dirname, "public")));

const apiRouter = express.Router();

// routes ##################################################################
apiRouter.use("/", indexRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/project", projectRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", [checkAdmin], adminRouter);

app.use("/api", jwtCheck, apiRouter);

// server instance ######################################################

var server = app.listen(config.port, function () {
  console.log("Backend Application listening at " + config.urls.backend);
});

module.exports = app;

