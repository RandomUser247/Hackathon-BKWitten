var express = require('express');
var router = express.Router();



// project endpoint
// get sends back project data responding to id
router.get("/:id", function(req, res){
    // validate parameter
    var _id = parseInt(req.params.id);
    if (_id || _id < 0){
        res.status(404).send("NO SUCH PROJECT");
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
router.post("/:id", function(req, res){
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
router.get("/", function(req, res){
    // get all project as list
    const stmt = db.prepare("SELECT * from projects");
    // respond with all projects
    res.send(stmt.run());
})


module.exports = router;




// try to get project by id and return project object
function getProject(projectid){
    const stmt = db.prepare("SELECT * FROM projects WHERE ID=(?)", projectid);
    var project = stmt.get();
    return project;
}

// return all stored projects
function getProjects(){
    var projects = db.all("SELECT * FROM project");
    return projects;
}

// Insert updated projectdata in database and return success
function updateProject(projectid, project){
    const stmt = db.prepare("UPDATE projects SET \
    title=$title, description=$description, vidlink=$vidlink, moretext=$moretext, lastedit=$lastedit\
    WHERE id=$projectid",
    {
        title: project.title,
        description: project.description,
        vidlink: project.vidlink,
        moretext: project.moretext,
        lastedit: new Date().getTime(),
        projectid: projectid
    })
}