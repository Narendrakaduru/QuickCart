const Log = require('../models/Log');

// @desc    Get system logs
// @route   GET /api/logs
// @access  Private/Admin
exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const query = {};

    // Optional filters
    if (req.query.action) {
      query.action = req.query.action;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Log.countDocuments(query);

    const logs = await Log.find(query)
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: logs
    });
  } catch (error) {
    console.error(`Get Logs Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error: Could not fetch logs'
    });
  }
};
