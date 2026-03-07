const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'superadmin'), logAction("PRODUCT_CREATED", "New product created"), createProduct);

router.route('/:id/reviews').post(protect, createProductReview);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin', 'superadmin'), logAction("PRODUCT_UPDATED", "Product details updated"), updateProduct)
  .delete(protect, authorize('admin', 'superadmin'), logAction("PRODUCT_DELETED", "Product deleted"), deleteProduct);

module.exports = router;
