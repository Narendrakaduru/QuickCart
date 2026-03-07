const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Define mock user ID outside or just use a static string inside the mock
const MOCK_USER_ID = '507f1f77bcf86cd799439011';

// Mock Auth Middleware
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011' };
    next();
  }
}));

// Import Routes and Controllers
const addressRoutes = require('../routes/addressRoutes');
const Address = require('../models/Address');

const app = express();
app.use(express.json());
app.use('/api/addresses', addressRoutes);

describe('Address API Endpoints', () => {

  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    // Connect to in-memory db or a test db if required, but here we can mock mongoose or use a basic connection
    // For simplicity without setting up mongod-memory-server, we will mock the Address model methods.
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/addresses', () => {
    it('should return all addresses for a user', async () => {
      const mockAddresses = [{ 
        _id: '1', user: mockUserId, street: '123 Main St', city: 'NY', state: 'NY', zip: '10001', country: 'US', phone: '1234567890', isDefault: true, addressType: 'Home' 
      }];
      
      Address.find = jest.fn().mockResolvedValue(mockAddresses);

      const res = await request(app).get('/api/addresses');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toEqual(mockAddresses);
      expect(Address.find).toHaveBeenCalledWith({ user: expect.any(String) });
    });
  });

  describe('POST /api/addresses', () => {
    it('should add a new address', async () => {
        const newAddressData = {
            fullName: 'John Doe',
            street: '123 Main St', city: 'NY', state: 'NY', zip: '10001', country: 'US', phone: '1234567890', 
            addressType: 'Home'
        };

        // Mock finding existing addresses (empty so this one becomes default)
        Address.find = jest.fn().mockResolvedValue([]);
        Address.create = jest.fn().mockResolvedValue({ ...newAddressData, _id: '1', user: mockUserId, isDefault: true });

        const res = await request(app)
            .post('/api/addresses')
            .send(newAddressData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBeTruthy();
        expect(res.body.data.isDefault).toBeTruthy();
    });
  });

});
