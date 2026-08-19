const request = require('supertest');
const app = require('../src/server');

jest.setTimeout(30000); // 30 seconds to prevent hook timeouts during hash/DB ops

describe('Product Endpoints', () => {
  let token;
  let sellerToken;

  beforeEach(async () => {
    // Register and login a normal user
    await request(app).post('/api/auth/register').send({
      name: 'User', email: 'user@example.com', password: 'Password123!'
    });
    const resUser = await request(app).post('/api/auth/login').send({
      identifier: 'user@example.com', password: 'Password123!'
    });
    // Extract token from Set-Cookie header
    token = resUser.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Register a seller user (mock role assignment if needed, or default)
    await request(app).post('/api/auth/register').send({
      name: 'Seller', email: 'seller@example.com', password: 'Password123!'
    });
    // Assuming backend automatically assigns seller based on env APPROVED_SELLER_EMAILS
    // which in test we can mock or we can manually set the role in DB
    const resSeller = await request(app).post('/api/auth/login').send({
      identifier: 'seller@example.com', password: 'Password123!'
    });
    sellerToken = resSeller.headers['set-cookie'][0].split(';')[0].split('=')[1];
  });

  describe('GET /api/products', () => {
    it('should return a list of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBeTruthy();
    });
  });

  describe('POST /api/products', () => {
    it('should fail if user is not a seller or admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', [`gm_access_token=${token}`])
        .send({
          title: 'Rolex Watch',
          price: 5000,
          category: 'Watches'
        });
      
      expect(res.statusCode).toEqual(403);
    });

    // To test successful creation, we'd need to mock the role or ensure the seller actually has the 'seller' role
  });
});
