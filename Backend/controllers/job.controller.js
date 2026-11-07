//Admin job posting
import { job } from "../models/job.model.js";
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      salary,
      jobType,
      position,
      companyId,
      experience,
    } = req.body;
    const userId = req.id; //middleware authentication
    if (
      !title ||
      !description ||
      !requirements ||
      !location ||
      !salary ||
      !jobType ||
      !position ||
      !companyId ||
      experience === undefined ||
      experience === null ||
      experience === ""
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    const newJob = await job.create({
      title,
      description,
      requirements: requirements.split(","),
      location,
      salary: Number(salary),
      jobType,
      position,
      company: companyId,
      experience: experience,
      created_by: userId,
    });
    return res.status(201).json({
      message: "Job posted successfully",
      newJob,
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
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await job
      .find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });
    if (jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Finally getting all jobs",
      jobs,
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
//Users
// Get a single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const foundJob = await job.findById(id).populate("company");

    if (!foundJob) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job found",
      job: foundJob,
      success: true,
    });
  } catch (error) {
    console.error("getJobById error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid job ID",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

//Admin job creation
export const getAdminJobs = async (req, res) => {
  try {
    const userId = req.id; //middleware authentication
    const jobs = await job.find({ created_by: userId });
    if (jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Admin jobs found",
      jobs,
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

export const updateJob = async (req, res) => {
  try {
    console.log("Job ID:", req.params.id);
    console.log("Recruiter ID:", req.id);

    const { id } = req.params;

    const existingJob = await job.findById(id);
    console.log("Job created_by:", existingJob?.created_by);
    console.log("Logged-in recruiter:", req.id);

    const updatedJob = await job.findOneAndUpdate(
      { _id: id, created_by: req.id },
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: "Job not found or you are not authorized to update it",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob,
      success: true,
    });
  } catch (error) {
    console.error("Update Job Error:", error);

    return res.status(500).json({
      message: "Failed to update job",
      success: false,
    });
  }
};

//delete job

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedJob = await job.findOneAndDelete({
      _id: id,
      created_by: req.id,
    });

    if (!deletedJob) {
      return res.status(404).json({
        message: "Job not found or you are not authorized to delete it",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete Job Error:", error);

    return res.status(500).json({
      message: "Failed to delete job",
      success: false,
    });
  }
};
