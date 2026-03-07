const express = require("express");
const upload = require("../utils/uploadMiddleware");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @desc    Upload image
// @route   POST /api/upload
// @access  Private/Superuser
router.post(
  "/",
  protect,
  authorize("admin", "superadmin"),
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload a file" });
    }

    res.status(200).json({
      success: true,
      data: `/uploads/${req.file.filename}`,
    });
  },
);

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Superuser
router.post(
  "/multiple",
  protect,
  authorize("admin", "superadmin"),
  upload.array("images", 5),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload files" });
    }

    const paths = req.files.map((file) => `/uploads/${file.filename}`);

    res.status(200).json({
      success: true,
      data: paths,
    });
  },
);

module.exports = router;
