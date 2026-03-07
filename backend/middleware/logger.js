const Log = require('../models/Log');

/**
 * Service function to manually log an event from anywhere in the codebase
 */
const logEvent = async ({ action, description, req, user, status = 'info' }) => {
  try {
    const logData = {
      action,
      description,
      user: user ? user._id : (req && req.user ? req.user._id : null),
      method: req ? req.method : 'SYSTEM',
      endpoint: req ? req.originalUrl : 'SYSTEM',
      status,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : '127.0.0.1',
    };

    await Log.create(logData);
  } catch (err) {
    console.error('Failed to write log to DB:', err);
  }
};

/**
 * Middleware wrapper to track a specific high-value API request automatically
 * Usage: router.post('/login', logAction('USER_LOGIN', 'User attempted to login'), loginUser)
 */
const logAction = (action, description) => {
  return async (req, res, next) => {
    // Capture the original response functions to tap into the response payload/status
    const originalSend = res.send;

    res.send = function (body) {
      // Determine if the request was successful based on status code
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      
      let responseUser = null;
      if (isSuccess && body) {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed.user && parsed.user.id) {
            responseUser = { _id: parsed.user.id };
          } else if (parsed.user && parsed.user._id) {
            responseUser = { _id: parsed.user._id };
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }

      // Async write to DB so we don't block the actual request
      logEvent({
        action,
        description: isSuccess ? `${description} (Successful)` : `${description} (Failed: ${res.statusCode})`,
        req,
        user: responseUser, // Pass extracted user if available
        status: isSuccess ? 'success' : 'error'
      });

      return originalSend.apply(this, arguments);
    };

    next();
  };
};

module.exports = { logEvent, logAction };
