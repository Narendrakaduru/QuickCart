const express = require("express");
const router = express.Router();
const {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");
const { logAction } = require("../middleware/logger");
const { orderLimiter } = require("../middleware/rateLimit");

router
  .route("/")
  .get(protect, authorize("admin", "superadmin"), getAllOrders)
  .post(protect, orderLimiter, logAction("ORDER_CREATED", "New order placed"), addOrderItems);

router.route("/myorders").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

router
  .route("/:id/status")
  .put(protect, authorize("admin", "superadmin"), logAction("ORDER_STATUS_UPDATE", "Order status updated"), updateOrderStatus);

router
  .route("/:id/payment")
  .put(protect, authorize("admin", "superadmin"), logAction("ORDER_PAYMENT_UPDATE", "Order payment status updated"), updatePaymentStatus);

router.route("/:id/cancel").put(protect, logAction("ORDER_CANCELLED", "Order cancelled"), cancelOrder);

module.exports = router;
