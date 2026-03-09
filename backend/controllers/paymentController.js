const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

// @desc    Create Razorpay Order
// @route   POST /api/payment/order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, error: "Razorpay order creation failed" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(`Razorpay Order Error: ${error.message}`);
    res.status(500).json({ success: false, error: "Server Error: Razorpay order creation failed" });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment verified
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "completed",
        updatedAt: Date.now(),
      });

      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error(`Razorpay Verify Error: ${error.message}`);
    res.status(500).json({ success: false, error: "Server Error: Payment verification failed" });
  }
};
