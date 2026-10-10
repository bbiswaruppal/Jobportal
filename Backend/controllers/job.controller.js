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
      !experience
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
    const jobs = await job.find(query).populate({
        path: "company",
    }).sort({ createdAt: -1 });
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
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const foundJob = await job.findById(jobId);
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
    console.error(error);
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
