const superAdminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "Admin" || req.user.isSuperAdmin !== true) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super Admin only.",
    });
  }

  next();
};

export default superAdminAuth;
