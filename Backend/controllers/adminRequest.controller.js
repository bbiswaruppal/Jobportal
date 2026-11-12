import { AdminRequest } from "../models/adminRequest.model.js";
import { User } from "../models/user.model.js";

// Submit Admin Request
export const createAdminRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason.",
      });
    }

    if (req.user.role === "Admin") {
      return res.status(400).json({
        success: false,
        message: "You are already an Admin.",
      });
    }

    const existingRequest = await AdminRequest.findOne({
      user: req.user._id,
    });

    if (existingRequest?.status === "Pending") {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request.",
      });
    }

    if (existingRequest) {
      existingRequest.reason = reason.trim();
      existingRequest.status = "Pending";
      existingRequest.reviewedBy = null;
      existingRequest.reviewedAt = null;
      await existingRequest.save();
    } else {
      await AdminRequest.create({
        user: req.user._id,
        reason: reason.trim(),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Admin request submitted successfully.",
    });
  } catch (error) {
    console.error("Create Admin Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit admin request.",
    });
  }
};

// Get All Admin Requests (Super Admin only)
export const getAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find()
      .populate("user", "fullname email role")
      .populate("reviewedBy", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get Admin Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin requests.",
    });
  }
};

// Approve Admin Request
export const approveAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);

    if (!request || request.status !== "Pending") {
      return res.status(404).json({
        success: false,
        message: "Pending admin request not found.",
      });
    }

    const user = await User.findById(request.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.role = "Admin";
    user.isSuperAdmin = false;
    await user.save();

    request.status = "Approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Admin request approved successfully.",
    });
  } catch (error) {
    console.error("Approve Admin Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve admin request.",
    });
  }
};

// Reject Admin Request
export const rejectAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);

    if (!request || request.status !== "Pending") {
      return res.status(404).json({
        success: false,
        message: "Pending admin request not found.",
      });
    }

    request.status = "Rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Admin request rejected successfully.",
    });
  } catch (error) {
    console.error("Reject Admin Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject admin request.",
    });
  }
};
