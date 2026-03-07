const express = require('express');
const {
  getCart,
  updateCart,
  clearCart
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCart)
  .post(updateCart)
  .delete(clearCart);

module.exports = router;
