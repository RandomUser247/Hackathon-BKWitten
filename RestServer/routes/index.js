var express = require('express');
var router = express.Router();

// default URL
router.get("/:universalURL", (req, res) =>{
  res.status(404).send("URL NOT FOUND");
})


// call to api root
router.get('/api', function(req, res) {
  console.log("api root called");
  res.send('API for the backend');
});

module.exports = router;
