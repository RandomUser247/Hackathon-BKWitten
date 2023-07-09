const request = require("supertest");
const expect = require("chai").expect;
const app = require("../app");

const user = {
  email: "some@dude.de",
  password: "wordpass",
};

describe("Authentication Routes", () => {
  // Test case for the POST /auth route
  describe("POST /api/auth", () => {
    it("should authenticate user and return a successful response", async () => {
      const response = await request(app)
        .post("/api/auth")
        .send(user)
        .expect(200)
        .expect({ message: "Login successful" });
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app)
        .post("/api/auth")
        .send({ email: "some@dude.de" }) // Missing password
        .expect(400);
    });

    it("should return 406 if wrong credentials are provided", async () => {
      const response = await request(app)
        .post("/api/auth")
        .send({ email: "some@dude.de", password: "wrongpassword" })
        .expect(406);
    });
  });

  // Test case for the DELETE /auth route
  describe("DELETE /api/auth", () => {
    it("should log out the user and return a successful response", async () => {
      const response = await request(app).delete("/api/auth").expect(200);
      expect(response.body).to.contain({ message: "Logout successful" });
    });
  });

 

  // Test case for the PUT /auth route
  describe("PUT /api/auth", () => {
    const agent = request.agent(app);
    beforeEach((done) => {
      agent
        .post("/api/auth")
        .send(user)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    afterEach((done) => {
      agent.delete("/api/auth").end((err, res) => {
        if (err) return done(err);
        done();
      });

      
    it("should update the user password and return a successful response", async () => {
          agent
            .put("/api/auth")
            .send({
              email: "some@dude.de",
              password: "password",
              newPassword: "passwort",
            })
            .expect(200)
            .expect({ message: "Password updated successfully" });
        });
    });
    it("should return 400 if invalid current password or new password is provided", async () => {
      agent
        .put("/api/auth")
        .send({
          email: "some@dude.de",
          password: "wrongpassword", // Invalid current password
          newPassword: "short", // Invalid new password
        })
        .expect(400);
    });

    it("should return 401 if unauthorized or invalid current password is provided", async () => {
      agent
        .put("/api/auth")
        .send({
          email: "some@dude.de",
          password: "wrongpassword", // Invalid current password
          newPassword: "newpassword",
        })
        .expect(401);
    });
  });
});
