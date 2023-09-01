// test all routes

const request = require("supertest");
const expect = require("expect");
const app = require("../app");

describe("GET /", () => {
  it("respond with the HTML body of the Express starter page", (done) => {
    request(app).get("/").expect(200)
    .expect("Content-Type", /html/)
    .end(done);
  });
});
