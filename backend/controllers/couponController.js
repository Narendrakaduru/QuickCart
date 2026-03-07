const Coupon = require("../models/Coupon");
const Log = require("../models/Log");

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, error: "Coupon not found" });
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, error: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
      usageLimit,
      createdBy: req.user._id,
    });

    // Log action
    await Log.create({
      action: "Coupon Created",
      description: `Created coupon ${code} with ${discountValue}${discountType === "percentage" ? "%" : " fixed"} discount`,
      user: req.user._id,
      method: "POST",
      endpoint: "/api/coupons",
      status: "success",
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, error: "Coupon not found" });
    }

    coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Log action
    await Log.create({
      action: "Coupon Updated",
      description: `Updated coupon properties for ${coupon.code}`,
      user: req.user._id,
      method: "PUT",
      endpoint: `/api/coupons/${req.params.id}`,
      status: "success",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, error: "Coupon not found" });
    }

    await coupon.deleteOne();

    // Log action
    await Log.create({
      action: "Coupon Deleted",
      description: `Deleted coupon ${coupon.code}`,
      user: req.user._id,
      method: "DELETE",
      endpoint: `/api/coupons/${req.params.id}`,
      status: "success",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ success: false, error: "Invalid or expired coupon" });
    }

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ success: false, error: "Coupon has expired" });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: "Coupon limit reached" });
    }

    // Check min purchase
    if (purchaseAmount < coupon.minPurchase) {
      return res.status(400).json({ success: false, error: `Minimum purchase of ₹${coupon.minPurchase} required` });
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
