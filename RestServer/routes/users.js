var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// /user endpoint
app.get('/api/user', function(req, res) {
  if(!req.body)
  // authenticate request
  if(!req.body.email){
      res.status(406).send("false credentials");
  }
  var userid = req.body[id]
  if(!userid) res.status(406).send("missing id");
  // get Data from Database
  const stmt = db.prepare("SELECT name from USERS WHERE ID=?", userid);
  var userdata = stmt.get();
  if(!userdata){
      res.status(406).send("user not found");
  }
  // send data
  res.send(userdata);
});





module.exports = router;

