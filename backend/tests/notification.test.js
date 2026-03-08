const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock Auth Middleware
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011' };
    next();
  }
}));

// Import Routes and Model
const notificationRoutes = require('../routes/notificationRoutes');
const Notification = require('../models/Notification');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notification API Endpoints', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should return all notifications for a user', async () => {
      const mockNotifications = [
        {
          _id: 'n1',
          user: '507f1f77bcf86cd799439011',
          type: 'order_placed',
          title: 'Order Placed',
          message: 'Your order has been placed.',
          isRead: false,
          createdAt: new Date(),
        },
      ];

      // Mock the chained query methods
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockNotifications),
        }),
      });

      const res = await request(app).get('/api/notifications');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toEqual('order_placed');
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should return the unread count', async () => {
      Notification.countDocuments = jest.fn().mockResolvedValue(3);

      const res = await request(app).get('/api/notifications/unread-count');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.count).toEqual(3);
      expect(Notification.countDocuments).toHaveBeenCalledWith({
        user: '507f1f77bcf86cd799439011',
        isRead: false,
      });
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const mockNotification = {
        _id: 'n1',
        user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        isRead: false,
        save: jest.fn().mockResolvedValue(true),
      };
      // After save, isRead should be true
      mockNotification.save.mockImplementation(function () {
        this.isRead = true;
        return Promise.resolve(this);
      }.bind(mockNotification));

      Notification.findById = jest.fn().mockResolvedValue(mockNotification);

      const res = await request(app).put('/api/notifications/n1/read');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(mockNotification.save).toHaveBeenCalled();
    });

    it('should return 404 for non-existent notification', async () => {
      Notification.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app).put('/api/notifications/bad_id/read');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBeFalsy();
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      Notification.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 5 });

      const res = await request(app).put('/api/notifications/read-all');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(Notification.updateMany).toHaveBeenCalledWith(
        { user: '507f1f77bcf86cd799439011', isRead: false },
        { isRead: true }
      );
    });
  });
});
