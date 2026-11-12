import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

// ==================== ADMIN DASHBOARD ====================
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Student" }),
      User.countDocuments({ role: "Recruiter" }),
      Company.countDocuments(),
      job.countDocuments(),
      Application.countDocuments(),

      // Count applications by status
      Application.countDocuments({ status: "pending" }),
      Application.countDocuments({ status: "accepted" }),
      Application.countDocuments({ status: "rejected" }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load Admin Dashboard",
      error: error.message,
    });
  }
};

// ==================== GET ALL USERS ====================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ==================== DELETE USER ====================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting your own account
    if (user._id.toString() === req.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting another admin
    if (user.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted through this API",
      });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// ==================== GET ALL COMPANIES ====================
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Get All Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
    });
  }
};

// ==================== DELETE COMPANY ====================
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await Company.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Delete Company Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET ALL JOBS ====================
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await job
      .find()
      .populate("company", "name")
      .populate("created_by", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get All Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

// ==================== DELETE JOB ====================
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const existingJob = await job.findById(id);

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    await job.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

// Get All Applications (Admin)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job", "title location salary")
      .populate("applicant", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// Update Application Status (Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "accepted", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

// ==================== GET ALL ADMINS ====================
// Super Admin Only

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: "Admin",
      isSuperAdmin: false,
    })
      .select("_id fullname email phoneNumber role isSuperAdmin createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Get All Admins Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
    });
  }
};

// ==================== DELETE ADMIN ====================
// Super Admin Only

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);

    if (!admin || admin.role !== "Admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.isSuperAdmin === true) {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot be removed",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Admin removed successfully",
    });
  } catch (error) {
    console.error("Delete Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove admin",
    });
  }
};
