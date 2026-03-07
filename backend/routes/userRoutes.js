const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

// All routes here are restricted to superadmin
router.use(protect);
router.use(authorize('superadmin'));

router
  .route('/')
  .get(getUsers)
  .post(logAction('USER_CREATED_BY_ADMIN', 'Superadmin created a new user'), createUser);

router
  .route('/:id')
  .put(logAction('USER_UPDATED_BY_ADMIN', 'Superadmin updated user details'), updateUser)
  .delete(logAction('USER_DELETED_BY_ADMIN', 'Superadmin deleted a user'), deleteUser);

module.exports = router;
