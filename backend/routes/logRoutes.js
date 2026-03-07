const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');

// All log routes require superadmin access
router.route('/').get(protect, authorize('superadmin'), getLogs);

module.exports = router;
