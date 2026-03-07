const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  addressType: {
    type: String,
    enum: ['Home', 'Office', 'Other'],
    default: 'Home'
  },
  fullName: {
    type: String,
    required: [true, 'Please add a full name']
  },
  street: {
    type: String,
    required: [true, 'Please add a street address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  state: {
    type: String,
    required: [true, 'Please add a state']
  },
  zip: {
    type: String,
    required: [true, 'Please add a postal code']
  },
  country: {
    type: String,
    required: [true, 'Please add a country']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Address', AddressSchema);
