import AuditLog from '../models/AuditLog.js';

/**
 * Middleware to log actions to audit log
 * @param {string} action - Action being performed
 */
export function auditLogger(action) {
  return async (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;

    // Override end function to log after response
    res.end = function(...args) {
      // Only log if response was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null;
        const username = req.user?.username || 'anonymous';
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        // Build details object
        const details = {
          method: req.method,
          path: req.path,
          params: req.params,
          query: req.query,
          statusCode: res.statusCode
        };

        // Log asynchronously without blocking response
        AuditLog.create(
          userId,
          username,
          action,
          JSON.stringify(details),
          ipAddress,
          userAgent
        ).catch(error => {
          console.error('Failed to create audit log:', error);
        });
      }

      // Call original end
      originalEnd.apply(res, args);
    };

    next();
  };
}

/**
 * Log specific action immediately
 */
export async function logAction(req, action, additionalDetails = {}) {
  try {
    const userId = req.user?.id || null;
    const username = req.user?.username || 'anonymous';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    const details = {
      method: req.method,
      path: req.path,
      ...additionalDetails
    };

    await AuditLog.create(
      userId,
      username,
      action,
      JSON.stringify(details),
      ipAddress,
      userAgent
    );
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}
