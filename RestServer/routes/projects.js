var express = require('express');
var router = express.Router();



// project endpoint
// get sends back project data responding to id
app.get("/api/project/:id", function(req, res){
    // validate parameter
    var _id = parseInt(req.params.id);
    if (_id || _id < 0){
        res.status(404).send("BAD REQUEST");
        return;
    }

    // get project data
    var project = getProject(_id)
    if(!project){
        res.status(404).send("project not found");
    }
    // send project data
    res.status(200).send(project);
});

// POST project updates data in project
app.post("/api/project/:id", function(req, res){
    // validate id
    var _id = parseInt(req.params.id);
    if (_id == NaN || _id < 0){
        res.status(404).send("BAD REQUEST");
        return;
    }
    // validate body data
    var params = req.body;
    var paramlist = [];
    var err = "";
    if(params.title){
        if(params.title.trim().length < 5){
            err += "you need a title at least 5 characters long \n"
            res.status(406).send(err);
            return;
        }
    }
    // insert data to project table row
    if(updateProject(req.body.id, req.body.project)){
        res.send("SUCCESS")
    }
    // send sucess response
});

// /overview endpoint, sends back all project data in a list
app.get("/api/overview", function(req, res){
    // get all project as list
    const stmt = db.prepare("SELECT * from projects");
    // respond with all projects
    res.send(stmt.run());
})


module.exports = router;