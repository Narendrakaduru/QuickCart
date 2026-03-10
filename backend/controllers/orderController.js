const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const InventoryLock = require("../models/InventoryLock");
const { clearProductCache } = require("./productController");
const { logEvent } = require("../middleware/logger");

// @desc    Reserve inventory temporarily for checkout
// @route   POST /api/orders/lock
// @access  Private
exports.lockInventory = async (req, res) => {
  try {
    const { items } = req.body; // Array of { product, quantity }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: "No items to lock" });
    }

    const locks = [];
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.product} not found` });
      }

      // Check availability: stockCount - reservedCount
      const available = Math.max(0, product.stockCount - (product.reservedCount || 0));
      if (available < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for ${product.title}. Available: ${available}, Requested: ${item.quantity}` 
        });
      }

      // Use an atomic update to prevent race conditions
      // This is the "Locking" part: only increment reservedCount if there is enough available stock
      const mongoose = require('mongoose');
      const updatedProduct = await Product.findOneAndUpdate(
        { 
          _id: item.product,
          $expr: { 
            $gte: [
              { $subtract: ["$stockCount", { $ifNull: ["$reservedCount", 0] }] }, 
              item.quantity
            ] 
          }
        },
        { $inc: { reservedCount: item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(400).json({ success: false, error: `Race condition: ${product.title} is no longer available in the requested quantity.` });
      }

      // Create or update the lock record
      const lock = await InventoryLock.findOneAndUpdate(
        { user: req.user._id, product: item.product },
        { 
          quantity: item.quantity, 
          expiresAt 
        },
        { upsert: true, new: true }
      );
      locks.push(lock);
      await clearProductCache(item.product.toString());
    }

    res.status(200).json({
      success: true,
      message: "Inventory reserved for 15 minutes",
      expiresAt
    });
  } catch (error) {
    console.error(`Lock Inventory Error: ${error.message}`);
    res.status(500).json({ success: false, error: "Server Error: Failed to reserve inventory" });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  try {
    const { items, shippingDetails, totalAmount, discountAmount, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      items,
      shippingDetails,
      totalAmount,
      discountAmount,
      couponCode,
    });

    const createdOrder = await order.save();

    // Decrement stock for each ordered item and clear reservations
    for (const item of items) {
      // Find if there was a lock for this user and product
      const lock = await InventoryLock.findOneAndDelete({ 
        user: req.user._id, 
        product: item.product 
      });

      if (lock) {
        // If a lock existed, we decrement both stockCount and reservedCount
        // Note: quantity might differ if user changed cart since locking, 
        // but for simplicity we assume the lock matches the order item.
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 
            stockCount: -item.quantity,
            reservedCount: -lock.quantity // Use the locked quantity to clear the reservation
          },
        });
      } else {
        // Direct order without a prior lock (e.g. from a script)
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockCount: -item.quantity },
        });
      }
      await clearProductCache(item.product.toString());
    }

    // If coupon was used, increment usedCount
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.trim().toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // Clear cart after order is placed
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Fire-and-forget notification
    Notification.create({
      user: req.user._id,
      type: "order_placed",
      title: "Order Placed",
      message: `Your order #${createdOrder._id.toString().slice(-8).toUpperCase()} has been placed successfully.`,
      orderId: createdOrder._id,
    }).catch((err) => console.error("Notification Error:", err.message));

    res.status(201).json({
      success: true,
      data: createdOrder,
    });

    // Track Activity: Order placed
    logEvent({
      action: "Order Placed",
      description: `User placed order #${createdOrder._id.toString().slice(-8).toUpperCase()} for ₹${totalAmount}`,
      req,
      status: "success"
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Order.countDocuments({});

    const orders = await Order.find({})
      .populate("user", "id name")
      .populate("items.product")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
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

    // Stock decrement now happens at order placement, not delivery

    order.orderStatus = req.body.status;
    order.updatedAt = Date.now();

    await order.save();

    // Notify user of order status change
    const statusLabel = req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1);
    Notification.create({
      user: order.user,
      type: "order_status",
      title: `Order ${statusLabel}`,
      message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been ${statusLabel.toLowerCase()}.`,
      orderId: order._id,
    }).catch((err) => console.error("Notification Error:", err.message));

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

    // Notify user of payment status change
    const paymentLabel = req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1);
    Notification.create({
      user: order.user,
      type: "order_payment",
      title: `Payment ${paymentLabel}`,
      message: `Payment for your order #${order._id.toString().slice(-8).toUpperCase()} has been marked as ${paymentLabel.toLowerCase()}.`,
      orderId: order._id,
    }).catch((err) => console.error("Notification Error:", err.message));

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

    // Restore stock since the order was cancelled
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: item.quantity },
      });
      await clearProductCache(item.product.toString());
    }

    // Notify user of cancellation
    Notification.create({
      user: order.user,
      type: "order_cancelled",
      title: "Order Cancelled",
      message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled.`,
      orderId: order._id,
    }).catch((err) => console.error("Notification Error:", err.message));

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

// @desc    Get all active inventory locks
// @route   GET /api/orders/locks
// @access  Private/Admin
exports.getInventoryLocks = async (req, res) => {
  try {
    const locks = await InventoryLock.find({})
      .populate("user", "name email")
      .populate("product", "title images price")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: locks.length,
      data: locks,
    });
  } catch (error) {
    console.error(`Get Inventory Locks Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not fetch inventory locks",
    });
  }
};
