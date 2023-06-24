// test all routes



describe("GET /", () => {
    it("respond with Hello World", (done) => {
        request(app).get("/").expect("Hello World", done);
    });
}
);

