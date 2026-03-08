const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../server'); // Note: This might need adjusting if server.js starts the listener

describe('Authentication Flow', () => {
  let server;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // Connect to a test database or rely on the one in .env if it's safe
    // For simplicity, we'll assume the developer has a test DB configured
  });

  afterAll(async () => {
    await User.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  it('should register a user and require verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBe('Verification email sent');

    const user = await User.findOne({ email: testUser.email });
    expect(user.isVerified).toBe(false);
    expect(user.verificationToken).toBeDefined();
  });

  it('should not allow login without verification', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toContain('verify your email');
  });

  it('should verify the email', async () => {
    const user = await User.findOne({ email: testUser.email });
    
    const res = await request(app)
      .get(`/api/auth/verifyemail/${user.verificationToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toBe('Email verified');

    const updatedUser = await User.findOne({ email: testUser.email });
    expect(updatedUser.isVerified).toBe(true);
    expect(updatedUser.verificationToken).toBeUndefined();
  });

  it('should allow login after verification', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
  });
});
