const request = require('supertest');
const app = require('../src/server');

jest.setTimeout(30000);

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toEqual(testUser.email);
    });

    it('should not allow duplicate email registration', async () => {
      // First registration (already done in previous block, but to be safe we'll register again)
      await request(app).post('/api/auth/register').send(testUser);

      // Duplicate registration
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Ensure user exists before login
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.email, password: testUser.password });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.headers['set-cookie']).toBeDefined(); // should set access and refresh tokens
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.email, password: 'wrongpassword' });
      
      expect(res.statusCode).toEqual(401);
    });
  });
});
