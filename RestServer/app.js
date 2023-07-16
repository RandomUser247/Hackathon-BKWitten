const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const config = require("./bin/config");
const { checkLogin, checkAdmin } = require("./bin/middleware");
const { log } = require("console");
const { expressjwt: jwt } = require("express-jwt");
const webtoken = require("jsonwebtoken");
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

// app.use #################################################################
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session(config.session));

// static routes ############################################################
// uploads for project media
// static files for frontend
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

