var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var bcrypt = require('bcrypt');


// database instance #######################################################
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./bin/db/test.db');
const saltround = 10;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mediaRouter = require('./routes/media');
var projectRouter = require('./routes/projects');
var authRouter = require('./routes/auth');

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/project', projectsRouter);
app.use('/media', mediaRouter);
app.use('/auth', authRouter);

// server instance ######################################################

var server = app.listen(8080, function() {
    console.log("Backend Application listening at http://localhost:8080")
});

module.exports = app;
