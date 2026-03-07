const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add item to cart or update quantity
// @route   POST /api/cart
// @access  Private
exports.updateCart = async (req, res, next) => {
  try {
    const { productId, quantity, action } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in cart
      let item = cart.items[itemIndex];
      
      if (action === 'add') {
        item.quantity += quantity;
      } else {
        item.quantity = quantity;
      }
      
      // If quantity is 0 or less, remove item
      if (item.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex] = item;
      }
    } else {
      // Product does not exist in cart, add new item
      if (quantity > 0) {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    
    // Populate to send back full product detail
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
