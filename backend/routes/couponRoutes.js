const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// Public route to validate coupon (Requires login)
router.post('/validate', protect, validateCoupon);

// Admin only routes
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.route('/')
  .get(getCoupons)
  .post(createCoupon);

router.route('/:id')
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
