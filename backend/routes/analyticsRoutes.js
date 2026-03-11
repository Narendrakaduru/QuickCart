const express = require('express');
const router = express.Router();
const { getSearchAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/search', protect, authorize('superadmin'), getSearchAnalytics);

module.exports = router;
