const request = require('supertest');
const app = require('../app');

describe('Project Routes', () => {
  // Test case for the GET /api/project/:id route
  describe('GET /api/project/:id', () => {
    it('should retrieve a project by ID and return a successful response', async () => {
      const response = await request(app).get('/api/project/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('project');
    });

    it('should return 404 if the project is not found', async () => {
      const response = await request(app).get('/api/project/999');

      expect(response.status).toBe(404);
      expect(response.text).toBe('project not found');
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(database, 'getProject').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app).get('/api/project/1');

      expect(response.status).toBe(500);
      expect(response.text).toBe('an internal error has occured');
    });
  });

  // Test case for the POST /api/project/:id route
  describe('POST /api/project/:id', () => {
    it('should update a project by ID and return a successful response', async () => {
      const response = await request(app)
        .post('/api/project/1')
        .send({ title: 'New Title', description: 'New Description' });

      expect(response.status).toBe(200);
      expect(response.text).toBe('SUCCESS');
    });

    it('should return 404 if the project is not found', async () => {
      const response = await request(app)
        .post('/api/project/999')
        .send({ title: 'New Title', description: 'New Description' });

      expect(response.status).toBe(404);
      expect(response.text).toBe('Bad request or project not found');
    });

    it('should return 406 if invalid input or validation error occurs', async () => {
      const response = await request(app)
        .post('/api/project/1')
        .send({ title: 'Short', description: 'New Description' });

      expect(response.status).toBe(406);
    });

    it('should return 405 if an internal server error occurs', async () => {
      jest.spyOn(database, 'updateProject').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app)
        .post('/api/project/1')
        .send({ title: 'New Title', description: 'New Description' });

      expect(response.status).toBe(405);
      expect(response.text).toBe('internal error occured');
    });
  });

  // Test case for the GET /api/project/overview route
  describe('GET /api/project/overview', () => {
    it('should retrieve project overview and return a successful response', async () => {
      const response = await request(app).get('/api/project/overview');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(database, 'getProjects').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app).get('/api/project/overview');

      expect(response.status).toBe(500);
      expect(response.text).toBe('An internal error occured');
    });
    });

    // Test case for the GET /api/project/search/:search route
  describe('GET /api/project/search/:search', () => {
    it('should retrieve project list by search and return a successful response', async () => {
      const response = await request(app).get('/api/project/search/some-search-term');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(database, 'getProjectsBySearch').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app).get('/api/project/search/some-search-term');

      expect(response.status).toBe(500);
      expect(response.text).toBe('An internal error occured');
    });
  });

 
});
