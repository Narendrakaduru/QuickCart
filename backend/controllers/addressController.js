const Address = require('../models/Address');

// @desc    Get all addresses for a user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: Could not fetch addresses' });
  }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    let isDefault = req.body.isDefault || false;

    // If it's the first address, force it to be default
    if (addresses.length === 0) {
      isDefault = true;
    } else if (isDefault) {
      // If this explicitly is default, unset default on others
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      ...req.body,
      isDefault,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: newAddress
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: Could not add address' });
  }
};

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    // Ensure user owns the address
    if (address.user.toString() !== req.user.id) {
       return res.status(401).json({ success: false, error: 'Not authorized to update this address' });
    }

    if (req.body.isDefault) {
       // Unset default on all other addresses
       await Address.updateMany({ user: req.user.id, _id: { $ne: req.params.id } }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: Could not update address' });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    // Ensure user owns the address
    if (address.user.toString() !== req.user.id) {
       return res.status(401).json({ success: false, error: 'Not authorized to delete this address' });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If default was deleted, assign default to another address if one exists
    if (wasDefault) {
       const remainingAddress = await Address.findOne({ user: req.user.id });
       if (remainingAddress) {
          remainingAddress.isDefault = true;
          await remainingAddress.save();
       }
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: Could not delete address' });
  }
};
