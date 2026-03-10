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
