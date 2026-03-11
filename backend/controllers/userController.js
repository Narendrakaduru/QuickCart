const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Superadmin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments({});

    const users = await User.find({})
      .select("-password")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: users,
    });
  } catch (error) {
    console.error(`Get Users Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Could not fetch users" });
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private/Superadmin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`Create User Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Could not create user" });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Superadmin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    let fieldsToUpdate = { name, email, role };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`Update User Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Could not update user" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(`Delete User Error: ${error.message}`);
    res
      .status(500)
      .json({ success: false, error: "Server Error: Could not delete user" });
  }
};

// @desc    Get user's recently viewed products
// @route   GET /api/v1/users/recently-viewed
// @access  Private
exports.getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'recentlyViewed',
      select: 'title price discountPercentage images rating numReviews countInStock isActive',
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Filter out inactive products from history
    const activeProducts = user.recentlyViewed.filter(p => p && p.isActive);

    res.status(200).json({
      success: true,
      data: activeProducts,
    });
  } catch (error) {
    console.error(`Get Recently Viewed Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error: Could not fetch recently viewed products',
    });
  }
};

// @desc    Add product to recently viewed
// @route   POST /api/v1/users/recently-viewed
// @access  Private
exports.addRecentlyViewed = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove the product if it already exists in the array (to move it to top later)
    user.recentlyViewed = user.recentlyViewed.filter(
      (id) => id.toString() !== productId.toString()
    );

    // Unshift to the beginning of the array
    user.recentlyViewed.unshift(productId);

    // Limit to 15 items
    if (user.recentlyViewed.length > 15) {
      user.recentlyViewed.pop();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product added to recently viewed',
    });
  } catch (error) {
    console.error(`Add Recently Viewed Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error: Could not update recently viewed products',
    });
  }
};
