const request = require("supertest");
const app = require("../app");
const { expect } = require("chai");

describe("Project Routes", () => {
  describe("GET /api/project/:id", () => {
    it("should retrieve a project by ID and return a successful response", (done) => {
      request(app)
        .get("/api/project/1")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((response) => {
          expect(response.body).to.have.property("project");
        })
        .end(done);
    });

    it("should return 404 if the project is not found", (done) => {
      request(app)
        .get("/api/project/999")
        .expect(404)
        .expect("Content-Type", /text/)
        .expect("project not found")
        .end(done);
    });
  });

  describe("POST /api/project/:id", () => {
    const projectPayload = {
        title: "Some Title",
        description: "Some Description",
        moretext: "Some more text",
        userid: 2,
      
    };
    const badProjectPayload = {
      title: "Some Title",
      moretext: "Some more text",
      userid: 2,
    };
    const user = {
      email: "some@dude.de",
      password: "wordpass",
    };
    var agent = request.agent(app);

    beforeEach("Login before project update", (done) => {
      agent
        .post("/api/auth")
        .send(user)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    afterEach("logout after project update", (done) => {
      agent
        .delete("/api/auth")
        .end((err, res) => {
          if (err) return done(err);
          done();
        })
    });

    it("should update a project by ID and return a successful response", (done) => {
      console.log("trying to update project");
      agent
        .post("/api/project/2")
        .send(projectPayload)
        .expect(200)
        .expect("Content-Type", /text/)
        .expect("SUCCESS")
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it("should redirect to login if the project is not owned", (done) => {
      agent
        .post("/api/project/999")
        .send(projectPayload)
        //expect redirect to login
        .expect(302)
        .end(done);
    });

    it("should return 400 if invalid input or validation error occurs", (done) => {
      agent
        .post("/api/project/2")
        .send(badProjectPayload)
        .expect(400)
        .end(done);
    });
  });

  describe("GET /api/project/overview", () => {
    it("should retrieve project overview and return a successful response", (done) => {
      request(app)
        .get("/api/project/overview")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((response) => {
          expect(response.body).to.exist;
        })
        .end(done);
    });
  });

  describe("GET /api/project/search/:search", () => {
    it("should retrieve project list by search and return a successful response", (done) => {
      request(app)
        .get("/api/project/search/some-search-term")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((response) => {
          expect(response.body).to.exist;
        })
        .end(done);
    });
  });
});
