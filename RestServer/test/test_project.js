const request = require("supertest");
const app = require("../app");

describe("Project Routes", () => {
  describe("GET /api/project/:id", () => {
    it("should retrieve a project by ID and return a successful response", (done) => {
      request(app)
        .get("/api/project/1")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect((response) => {
          expect(response.body).toHaveProperty("project");
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
    it("should update a project by ID and return a successful response", (done) => {
      request(app)
        .post("/api/project/1")
        .send({ title: "New Title", description: "New Description" })
        .expect(200)
        .expect("Content-Type", /text/)
        .expect("SUCCESS")
        .end(done);
    });

    it("should return 404 if the project is not found", (done) => {
      request(app)
        .post("/api/project/999")
        .send({ title: "New Title", description: "New Description" })
        .expect(404)
        .expect("Content-Type", /text/)
        .expect("Bad request or project not found")
        .end(done);
    });

    it("should return 406 if invalid input or validation error occurs", (done) => {
      request(app)
        .post("/api/project/1")
        .send({ title: "Short", description: "New Description" })
        .expect(406)
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
          expect(response.body).toBeDefined();
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
          expect(response.body).toBeDefined();
        })
        .end(done);
    });
  });
});
