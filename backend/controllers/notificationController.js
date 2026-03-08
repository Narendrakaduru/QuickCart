const Notification = require("../models/Notification");

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error(`Get Notifications Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not fetch notifications",
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(`Get Unread Count Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not fetch unread count",
    });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    // Ensure the notification belongs to the user
    if (notification.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ success: false, error: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error(`Mark As Read Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not update notification",
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(`Mark All As Read Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not update notifications",
    });
  }
};
