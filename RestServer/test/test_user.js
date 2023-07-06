// test all routes

const request = require('supertest');
const expect = require('expect');
const app = require('../app');


describe("GET /", () => {
    it("respond with Hello World", (done) => {
        request(app).get("/").expect(HTMLElement, done);
    });
}
);

