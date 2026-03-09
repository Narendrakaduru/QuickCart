const express = require("express");
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.post("/order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyRazorpayPayment);

module.exports = router;
