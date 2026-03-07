const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ success: true, data: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle product in wishlist (add/remove)
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const user = await User.findById(req.user.id);

    // Check if product is already in wishlist
    const index = user.wishlist.indexOf(productId);

    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
    }

    await user.save();
    
    // Send back populated wishlist
    const updatedUser = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({ success: true, data: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
