const request = require('supertest');
const app = require('../app');

describe('Authentication Routes', () => {
  // Test case for the POST /auth route
  describe('POST /auth', () => {
    it('should authenticate user and return a successful response', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ email: 'some@dude.de', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ email: 'some@dude.de' }); // Missing password

      expect(response.status).toBe(400);
    });

    it('should return 401 if wrong credentials are provided', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ email: 'some@dude.de', password: 'wrongpassword' });

      expect(response.status).toBe(401);
    });
  });

  // Test case for the DELETE /auth route
  describe('DELETE /auth', () => {
    it('should log out the user and return a successful response', async () => {
      const response = await request(app).delete('/auth');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });

  // Test case for the PUT /auth route
  describe('PUT /auth', () => {
    it('should update the user password and return a successful response', async () => {
      const response = await request(app)
        .put('/auth')
        .send({
          email: 'some@dude.de',
          password: 'password',
          newPassword: 'passwort',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password updated successfully');
    });

    it('should return 400 if invalid current password or new password is provided', async () => {
      const response = await request(app)
        .put('/auth')
        .send({
          email: 'some@dude.de',
          password: 'wrongpassword', // Invalid current password
          newPassword: 'short', // Invalid new password
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 if unauthorized or invalid current password is provided', async () => {
      const response = await request(app)
        .put('/auth')
        .send({
          email: 'some@dude.de',
          password: 'wrongpassword', // Invalid current password
          newPassword: 'newpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
