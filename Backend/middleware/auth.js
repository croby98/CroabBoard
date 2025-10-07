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
    isAdmin: req.session.user.isAdmin || 0,
    adminRole: req.session.user.isAdmin || 0, // 0 = user, 1 = light_admin, 2 = super_admin
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
      isAdmin: req.session.user.isAdmin || 0,
      adminRole: req.session.user.isAdmin || 0,
      avatar: req.session.user.avatar || null
    };
  } else {
    req.user = null;
  }
  next();
};

// Admin-only middleware (checks if user has any admin role - light or super)
export const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Check if user has admin role from session (1 = light_admin, 2 = super_admin)
  if (!req.session.user.isAdmin || req.session.user.isAdmin === 0) {
    // Double-check from database in case role was updated
    try {
      const user = await User.findById(req.session.user.id);
      if (!user || !user.is_admin || user.is_admin === 0) {
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
    isAdmin: req.session.user.isAdmin,
    adminRole: req.session.user.isAdmin,
    avatar: req.session.user.avatar || null
  };
  next();
};

// Super admin-only middleware (only for super_admin role = 2)
export const requireSuperAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Check if user has super admin role from session
  if (req.session.user.isAdmin !== 2) {
    // Double-check from database in case role was updated
    try {
      const user = await User.findById(req.session.user.id);
      if (!user || user.is_admin !== 2) {
        return res.status(403).json({
          success: false,
          message: 'Super admin access required'
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
    isAdmin: 2,
    adminRole: 2,
    avatar: req.session.user.avatar || null
  };
  next();
};
