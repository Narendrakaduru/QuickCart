const Order = require("../models/Order");
const Cart = require("../models/Cart");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  try {
    const { items, shippingDetails, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      items,
      shippingDetails,
      totalAmount,
    });

    const createdOrder = await order.save();

    // Clear cart after order is placed
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (error) {
    console.error(`Add Order Items Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Order placement failed" });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort("-createdAt");
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(`Get My Orders Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Could not fetch orders" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Check if order belongs to user
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(`Get Order By ID Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Could not fetch order" });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id name")
      .populate("items.product")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(`Get All Orders Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not fetch all orders",
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // NEW: Only allow 'delivered' if payment is completed
    if (
      req.body.status === "delivered" &&
      order.paymentStatus !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Order cannot be marked as Delivered until payment is Completed.",
      });
    }

    order.orderStatus = req.body.status;
    order.updatedAt = Date.now();

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "id name")
      .populate("items.product");

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error(`Update Order Status Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Status update failed" });
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    order.paymentStatus = req.body.status;
    order.updatedAt = Date.now();

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "id name")
      .populate("items.product");

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error(`Update Payment Status Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Payment update failed" });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Check if order belongs to user or is admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // Check if order can be cancelled
    if (
      order.orderStatus === "shipped" ||
      order.orderStatus === "delivered" ||
      order.orderStatus === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        error: "Order already shipped, delivered, or cancelled.",
      });
    }

    order.orderStatus = "cancelled";
    order.updatedAt = Date.now();

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "id name")
      .populate("items.product");

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error(`Cancel Order Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Cancellation failed" });
  }
};
