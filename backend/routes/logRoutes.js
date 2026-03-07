const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');

// All log routes require admin access
router.route('/').get(protect, authorize('admin', 'superadmin'), getLogs);

module.exports = router;
