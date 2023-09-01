const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./bin/db/test.db");
const helpers = require("../helpers.js");

const TIME = new Date();

const usersData = [
  { useremail: "admin@school.de", name: "admin", password: "password", isadmin: 1 },
  { useremail: "Rob@school.de", name: "USER2",  password: "password", isadmin: 0 },
  { useremail: "Memo@school.de", name: "USER3", password: "password", isadmin: 0 },
  { useremail: "Jonas@woboda.de", name: "USER4", password: "password", isadmin: 0 },
  { useremail: "some@dude.de", name: "USER5", password: "wordpass", isadmin: 0 },
];

const projectData = [
  {
    userid: 1,
    title: "cool project1",
    description: "some text",
    vidlink: "",
    moretext: "hahahahahahha",
    lastedit: TIME.getTime(),
    creationdate: TIME.getTime(),
  },
  {
    userid: 2,
    title: "cool project2",
    description: "some text",
    vidlink: "",
    moretext: "hahahahahahha",
    lastedit: TIME.getTime(),
    creationdate: TIME.getTime(),
  },
  {
    userid: 3,
    title: "cool project3",
    description: "some text",
    vidlink: "",
    moretext: "hahahahahahha",
    lastedit: TIME.getTime(),
    creationdate: TIME.getTime(),
  },
  {
    userid: 4,
    title: "cool project4",
    description: "some text",
    vidlink: "",
    moretext: "hahahahahahha",
    lastedit: TIME.getTime(),
    creationdate: TIME.getTime(),
  },
  {
    userid: 5,
    title: "cool project5",
    description: "some text",
    vidlink: "",
    moretext: "hahahahahahha",
    lastedit: TIME.getTime(),
    creationdate: TIME.getTime(),
  },
];

var insertUserQuery = "Insert INTO users (email, name, hashpass, isadmin) VALUES (?, ?, ?, ?)";

var insertProjectQuery =
  "INSERT INTO projects (userid, title, description, vidlink, moretext, lastedit, creationdate) \
    VALUES ($userid, $title, $description, $vidlink, $moretext, $lastedit, $creationdate)";

const insertUsersAndProjects = () => {
  return new Promise((resolve, reject) => {
    const insertUserPromises = usersData.map((user) => {
      return helpers
        .encrypt(user.password)
        .then((hashedPassword) => {
          return new Promise((resolve, reject) => {
            db.run(insertUserQuery, [user.useremail.toLowerCase(), user.name, hashedPassword, user.isadmin], (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        })
        .catch((err) => {
          console.error(err);
        });
    });

    Promise.all(insertUserPromises)
      .then(() => {
        const insertProjectPromises = projectData.map((project) => {
          return new Promise((resolve, reject) => {
            db.run(
              insertProjectQuery,
              {
                $userid: project.userid,
                $title: project.title,
                $description: project.description,
                $vidlink: project.vidlink,
                $moretext: project.moretext,
                $lastedit: project.lastedit,
                $creationdate: project.creationdate,
              },
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        });

        Promise.all(insertProjectPromises)
          .then(() => {
            console.log("Users and projects inserted");
            db.close();
            resolve();
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

insertUsersAndProjects()
  .then(() => {
    console.log("All operations completed successfully");
  })
  .catch((err) => {
    console.error("An error occurred:", err);
  });
