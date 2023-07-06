// testing the admin rout
const request = require('supertest');
const expect = require('expect');
const app = require('../app');


// setup for admin rout testing
const admin = {
    username: "admin@school.de",
    password: "password"
}



describe("GET /api/admin/users", () => {
  it("respond with json containing a list of all users", (done) => {

    request(app)
      .get("/api/admin/users")
      .set("Accept", "application/json")
      .expect(200, done);
  });
});

describe("GET /api/admin/users/:id", () => {
    it("respond with json containing a single user", (done) => {
        request(app)
        .get("/api/admin/users/1")
        .set("Accept", "application/json")
        .expect(200, done);
    });
    }
    );

// test project visibility toggle
describe("POST /api/admin/project/:id", () => {
    it("respond with json containing a single project", (done) => {
        request(app)
        .post("/api/admin/project/1")
        .set("Accept", "application/json")
        .expect(200, done);
    });
    }
    );

// test media deletion
describe("DELETE /api/admin/media/:id", () => {
    it("respond with json containing a single media", (done) => {
        request(app)
        .delete("/api/admin/media/1")
        .set("Accept", "application/json")
        .expect(200, done);
    });
    }
    );

// test log retrieval
describe("GET /api/admin/logs", () => {
    it("respond with json containing a single log", (done) => {
        request(app)
        .get("/api/admin/logs")
        .set("Accept", "application/json")
        .expect(200, done);
    });
    }
    );

    // test most recent Media retrieval
describe("GET /api/admin/media", () => {
    it("respond with json containing list of Media", (done) => {
        request(app)
        .get("/api/admin/media")
        .set("Accept", "application/json")
        .expect(200, done);
    });
    }
    );
