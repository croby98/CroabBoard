import { User } from '../models/mysql-models.js';

// Session-based authentication middleware
export const authenticateUser = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  req.user = {
    id: req.session.user.id,
    username: req.session.user.username,
    btnSize: req.session.user.btnSize,
    isAdmin: req.session.user.isAdmin || false,
    avatar: req.session.user.avatar || null
  };
  next();
};

// Optional authentication - continues even if not authenticated
export const optionalAuth = (req, res, next) => {
  if (req.session.user) {
    req.user = {
      id: req.session.user.id,
      username: req.session.user.username,
      btnSize: req.session.user.btnSize,
      isAdmin: req.session.user.isAdmin || false,
      avatar: req.session.user.avatar || null
    };
  } else {
    req.user = null;
  }
  next();
};

// Admin-only middleware (checks if user has admin role)
export const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Check if user has admin role from session
  if (!req.session.user.isAdmin) {
    // Double-check from database in case role was updated
    try {
      const user = await User.findById(req.session.user.id);
      if (!user || !user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      // Update session with current admin status
      req.session.user.isAdmin = user.is_admin;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error verifying admin status'
      });
    }
  }

  req.user = {
    id: req.session.user.id,
    username: req.session.user.username,
    btnSize: req.session.user.btnSize,
    isAdmin: true,
    avatar: req.session.user.avatar || null
  };
  next();
};
