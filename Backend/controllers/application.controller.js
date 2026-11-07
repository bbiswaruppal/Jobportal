import { Application } from "../models/application.model.js";
import { job } from "../models/job.model.js";
import transporter from "../config/email.js";
import Notification from "../models/notification.model.js";

// 1. Apply for a job
export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    // Only students can apply for jobs
    if (req.user.role !== "Student") {
      return res.status(403).json({
        message: "Only students are allowed to apply for jobs",
        success: false,
      });
    }

    if (!jobId) {
      return res.status(400).json({
        message: "Invalid job id",
        success: false,
      });
    }

    // Check if the user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }

    // Check if the job exists
    const jobData = await job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    // Create a new application
    const newApplication = await new Application({
      job: jobId,
      applicant: userId,
    });

    await newApplication.save();

    // Add application ID to the job
    if (!Array.isArray(jobData.applications)) {
      jobData.applications = [];
    }

    jobData.applications.push(newApplication._id);
    await jobData.save();

    return res.status(201).json({
      message: "Application submitted successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

// 2. Get jobs applied for by the logged-in user
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;

    const applications = await Application.find({
      applicant: userId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: {
          path: "company",
        },
      });

    if (applications.length === 0) {
      return res.status(200).json({
        message: "No applications found",
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      message: "Applications fetched successfully",
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

// 3. Get applicants for recruiter's own job
export const getApplicants = async (req, res) => {
  try {
    const recruiterId = req.id;
    const jobId = req.params.id;

    // Check whether this job belongs to the logged-in recruiter
    const jobData = await job.findOne({
      _id: jobId,
      created_by: recruiterId,
    });

    if (!jobData) {
      return res.status(404).json({
        message: "Job not found or you are not authorized",
        success: false,
      });
    }

    const applications = await Application.find({
      job: jobId,
    }).populate({
      path: "applicant",
      select: "fullname email phoneNumber resume resumeOriginalname",
    });

    return res.status(200).json({
      message: "Applicants fetched successfully",
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get applicants error:", error);

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

// 4. Update application status securely
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    const recruiterId = req.id;

    if (
      !status ||
      !["pending", "accepted", "rejected"].includes(status.toLowerCase())
    ) {
      return res.status(400).json({
        message: "Invalid application status",
        success: false,
      });
    }

    // Find the application
    const applicationData =
      await Application.findById(applicationId).populate("applicant");

    if (!applicationData) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    // Check whether this job belongs to the logged-in recruiter
    const jobData = await job.findOne({
      _id: applicationData.job,
      created_by: recruiterId,
    });

    if (!jobData) {
      return res.status(403).json({
        message: "You are not authorized to update this application",
        success: false,
      });
    }

    applicationData.status = status.toLowerCase();
    await applicationData.save();

    // Create In-App Notification
    try {
      if (["accepted", "rejected"].includes(applicationData.status)) {
        const applicantId = applicationData.applicant?._id;

        if (!applicantId) {
          throw new Error("Applicant ID not found");
        }

        const notificationType =
          applicationData.status === "accepted"
            ? "application_accepted"
            : "application_rejected";

        const message =
          applicationData.status === "accepted"
            ? `Congratulations! Your application for ${jobData.title} has been accepted.`
            : `Your application for ${jobData.title} has been rejected.`;

        const newNotification = await Notification.create({
          recipient: applicantId,
          message,
          type: notificationType,
        });

        console.log("In-app notification created:", newNotification._id);
      }
    } catch (notificationError) {
      console.error("In-app notification failed:", notificationError);
    }

    // Send email notification to applicant
    try {
      const applicant = applicationData.applicant;

      if (
        applicant?.email &&
        ["accepted", "rejected"].includes(applicationData.status)
      ) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: applicant.email,
          subject: `Application Status: ${applicationData.status}`,
          text: `Hello ${applicant.fullname || "Applicant"},

Your job application for ${jobData.title} has been ${applicationData.status}.

Thank you for applying.

Regards,
Recruitment Team`,
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError.message);
    }

    return res.status(200).json({
      message: "Application status updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Update application status error:", error);

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};
