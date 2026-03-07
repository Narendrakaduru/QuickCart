const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please add a product title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  brand: {
    type: String,
    required: [true, "Please add a product brand"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [2000, "Description cannot be more than 2000 characters"],
  },
  highlights: {
    type: [String],
    default: [],
  },
  specifications: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  price: {
    type: Number,
    required: [true, "Please add a price"],
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  images: {
    type: [String], // Array of image URLs
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
  },
  stockCount: {
    type: Number,
    required: [true, "Please add stock count"],
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  reviews: [
    {
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
