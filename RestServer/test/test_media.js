const request = require("supertest");
const expect = require("chai").expect;
const app = require("../app");
const jest = require("jest");
const database = require("../bin/db/databaseInteractor");

describe("Media Routes", () => {
  const agent = request.agent(app);
  before(() => {
    agent
      .post("/api/auth")
      .send({ email: "some@dude.de", password: "wordpass" })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  after(() => {
    agent.delete("/api/auth").then((res) => {
      expect(res.status).toBe(200);
    });
  });

  // Test case for the PUT /api/media route
  describe("PUT /api/media", () => {
    it("should upload an image and return a successful response", async () => {
      agent
        .put("/api/media")
        .set("Authorization", "Bearer <token>")
        .attach("image", "<path_to_image>")
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body).toHaveProperty("imageid");
        });
    });

    it("should return 401 if not authenticated", async () => {
      agent
        .put("/api/media")
        .attach("image", "<path_to_image>")
        .then((response) => {
          expect(response.status).toBe(401);
        });
    });

    it("should return 500 if image upload fails", async () => {
      agent
        .put("/api/media")
        .set("Authorization", "Bearer <token>")
        .attach("image", "<path_to_image>")
        .then((response) => {
          expect(response.status).toBe(500);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toBe("Failed to upload image");
        });
    });

    it("should return 500 if an internal server error occurs", async () => {

      agent
        .put("/api/media")
        .set("Authorization", "Bearer <token>")
        .attach("image", "<path_to_image>")
        .then((response) => {
          expect(response.status).toBe(500);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toBe(
            "An error occurred during image upload"
          );
        });
    });
  });

  // Test case for the DELETE /api/media/:id route
  describe("DELETE /api/media/:id", () => {
    it("should delete an image and return a successful response", async () => {
      agent
        .delete("/api/media/1")
        .set("Authorization", "Bearer <token>")
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.text).toBe("Image deleted successfully");
        });
    });

    it("should return 404 if the image is not found", async () => {
      agent
        .delete("/api/media/999")
        .set("Authorization", "Bearer <token>")
        .then((response) => {
          expect(response.status).toBe(404);
          expect(response.text).toBe("Image not found");
        });
    });

    it("should return 500 if an internal server error occurs", async () => {

      agent
        .delete("/api/media/1")
        .set("Authorization", "Bearer <token>")
        .then((response) => {
          expect(response.status).toBe(500);
          expect(response.text).toBe("Internal Server Error");
        });
    });
  });

  // Test case for the GET /api/media/:id route
  describe("GET /api/media/:id", () => {
    it("should retrieve an image by ID and return a successful response", async () => {
      agent.get("/api/media/1").then((response) => {
        expect(response.status).toBe(200);
        expect(response.type).toBe("image/*");
      });
    });

    it("should return 404 if the image is not found", async () => {
      agent.get("/api/media/999").then((response) => {
        expect(response.status).toBe(404);
        expect(response.text).toBe("Image not found");
      });
    });

    it("should return 500 if an internal server error occurs", async () => {

      agent.get("/api/media/1").then((response) => {
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal Server Error");
      });
    });
  });

  // Test case for the GET /api/media/own route
  describe("GET /api/media/own", () => {
    it("should retrieve the user's image and return a successful response", async () => {
      agent
        .get("/api/media/own")
        .set("Authorization", "Bearer <token>")
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.type).toBe("image/*");
        });
    });

    it("should return 500 if an internal server error occurs", async () => {
      agent
        .get("/api/media/own")
        .set("Authorization", "Bearer <token>")
        .then((response) => {
          expect(response.status).toBe(500);
          expect(response.text).toBe("Internal Server Error");
        });
    });
  });
});
