var express = require('express');
var router = express.Router();
const swaggerJsDoc = require("swagger-jsdoc");
const config = require("../bin/config");
const swaggerUi = require("swagger-ui-express");
const path = require("path");



const specs = swaggerJsDoc(config.swaggerOptions);


router.use(express.static(path.join(__dirname, "public/images")));
router.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
// routes ##################################################################
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
