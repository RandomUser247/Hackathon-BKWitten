var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./bin/db/test.db');


// project endpoint



// get sends back project data responding to id
router.get("/:id(\\d+)", async function(req, res){
    try {
    // validate parameter
    var _id = parseInt(req.params.id);
    if (!_id || _id < 0){
        res.status(404).send("NO SUCH PROJECT");
    }
    // get project data
    var project = await getProject(_id);
    if(!project){
        res.status(404).send("project not found");
    }
    // send project data
    res.status(200).json({project: project});
    }
    catch(err){
        console.error(err);
        res.status(500).send("an internal error has occured");
    }
});

// POST project updates data in project
router.post("/:id", async function(req, res){
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
    if( await updateProject(req.body.id, req.body.project)){
        res.send("SUCCESS")
    }
    else res.status(405).send("internal error occured")
    // send sucess response
});

// /overview endpoint, sends back all project data in a list
router.get("/overview", async function(req, res){
    // get all project as list
    const projects = await getProjects();
    // respond with all projects
    res.send(projects);
})



module.exports = router;




// try to get project by id and return project object
function getProject(projectid){
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM projects WHERE ID = ?", projectid, function(err, row) {
            if(err){
                reject(err);
                return;
            }
            if(!row){
                console.log("no matching row found");
                resolve(null);
                return;
            }
            console.log(row);
            resolve(row);
        });
    });
    
}

// return all stored projects
function getProjects(){
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM projects", function(err, rows){
            if(err){
                reject(err);
                return;
            }
            if(!rows){
                console.log("no rows found");
                resolve(null);
                return;
            }
            resolve(rows);
        });
        
    }
    );
}

// Insert updated projectdata in database and return success
function updateProject(projectid, project){
    return new Promise((resolve, reject) => {
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
        });
        try {
            if(db.run(stmt)) resolve(true);            
        } catch (err) {
            resolve(err)
        }
        
    });
}