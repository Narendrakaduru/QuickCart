const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getSearchSuggestions,
  getRecommendations,
  getSimilarProducts
} = require('../controllers/productController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const router = express.Router();

router.get('/suggestions', getSearchSuggestions);
router.get('/recommendations', getRecommendations);

router
  .route('/')
  .get(optionalAuth, getProducts)
  .post(protect, authorize('admin', 'superadmin'), logAction("PRODUCT_CREATED", "New product created"), createProduct);

router.route('/:id/reviews').post(protect, createProductReview);
router.get('/:id/similar', optionalAuth, getSimilarProducts);

router
  .route('/:id')
  .get(optionalAuth, getProduct)
  .put(protect, authorize('admin', 'superadmin'), logAction("PRODUCT_UPDATED", "Product details updated"), updateProduct)
  .delete(protect, authorize('admin', 'superadmin'), logAction("PRODUCT_DELETED", "Product deleted"), deleteProduct);

module.exports = router;
