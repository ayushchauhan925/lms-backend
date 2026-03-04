// src/middleware/role.middleware.js

const allowRoles = (...roles) => {
  return (req, res, next) => {
    // Make sure user exists (protect middleware should run before this)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = { allowRoles };