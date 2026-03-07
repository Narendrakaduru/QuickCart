const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController');
const { logAction } = require('../middleware/logger');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', logAction('USER_REGISTERED', 'New user registered'), register);
router.post('/login', logAction('USER_LOGIN', 'User logged in'), login);
router.get('/logout', protect, logAction('USER_LOGOUT', 'User logged out'), logout);
router.get('/me', protect, getMe);

module.exports = router;
