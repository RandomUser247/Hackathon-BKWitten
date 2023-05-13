const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('/db/test.db')


var express = require('express');
var app = express();app.get('/', function(req, res) {
    res.send('API for the backend');
});

var server = app.listen(8080, function() {
    console.log("Backend Application listening at http://localhost:8080")
});