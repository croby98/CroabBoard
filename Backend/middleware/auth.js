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
    btnSize: req.session.user.btnSize
  };
  next();
};

// Optional authentication - continues even if not authenticated
export const optionalAuth = (req, res, next) => {
  if (req.session.user) {
    req.user = {
      id: req.session.user.id,
      username: req.session.user.username,
      btnSize: req.session.user.btnSize
    };
  } else {
    req.user = null;
  }
  next();
};

// Admin-only middleware (checks if user is the owner)
export const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Check if user ID is 1 (owner)
  if (req.session.user.id !== 1) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  req.user = {
    id: req.session.user.id,
    username: req.session.user.username,
    btnSize: req.session.user.btnSize
  };
  next();
};
