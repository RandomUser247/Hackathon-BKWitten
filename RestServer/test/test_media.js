const request = require('supertest');
const app = require('../app');

describe('Media Routes', () => {
  // Test case for the PUT /media route
  describe('PUT /media', () => {
    it('should upload an image and return a successful response', async () => {
      const response = await request(app)
        .put('/media')
        .set('Authorization', 'Bearer <token>')
        .attach('image', '<path_to_image>');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('imageid');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).put('/media').attach('image', '<path_to_image>');

      expect(response.status).toBe(401);
    });

    it('should return 500 if image upload fails', async () => {
      jest.spyOn(database, 'insertMedia').mockImplementationOnce(() => null);

      const response = await request(app)
        .put('/media')
        .set('Authorization', 'Bearer <token>')
        .attach('image', '<path_to_image>');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to upload image');
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(database, 'insertMedia').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app)
        .put('/media')
        .set('Authorization', 'Bearer <token>')
        .attach('image', '<path_to_image>');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('An error occurred during image upload');
    });
  });

  // Test case for the DELETE /media/:id route
  describe('DELETE /media/:id', () => {
    it('should delete an image and return a successful response', async () => {
      const response = await request(app)
        .delete('/media/1')
        .set('Authorization', 'Bearer <token>');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Image deleted successfully');
    });

    it('should return 404 if the image is not found', async () => {
      const response = await request(app)
        .delete('/media/999')
        .set('Authorization', 'Bearer <token>');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Image not found');
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(database, 'deleteFile').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app)
        .delete('/media/1')
        .set('Authorization', 'Bearer <token>');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal Server Error');
    });
  });

  // Test case for the GET /media/:id route
  describe('GET /media/:id', () => {
    it('should retrieve an image by ID and return a successful response', async () => {
      const response = await request(app).get('/media/1');

      expect(response.status).toBe(200);
      expect(response.type).toBe('image/*');
    });

    it('should return 404 if the image is not found', async () => {
      const response = await request(app).get('/media/999');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Image not found');
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(database, 'getPath').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app).get('/media/1');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal Server Error');
    });
  });

  // Test case for the GET /media/own route
  describe('GET /media/own', () => {
    it('should retrieve the user\'s image and return a successful response', async () => {
      const response = await request(app)
        .get('/media/own')
        .set('Authorization', 'Bearer <token>');

      expect(response.status).toBe(200);
      expect(response.type).toBe('image/*');
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(database, 'getPath').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app)
        .get('/media/own')
        .set('Authorization', 'Bearer <token>');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal Server Error');
    });
  });
});
