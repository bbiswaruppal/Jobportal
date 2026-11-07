const isRecruiter = (req, res, next) => {
  if (!req.user || req.user.role !== "Recruiter") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Recruiter only.",
    });
  }

  next();
};

export default isRecruiter;
