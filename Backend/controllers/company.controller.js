import { Company } from "../models/company.model.js";
export const registerCompany = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { companyName, description, website, location, address } = req.body;
    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }
    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(400).json({
        message: "Company already exists",
      });
    }

    company = await Company.create({
      name: companyName,
      description: description,
      website: website,
      location: location,
      address: address,
      userId: req.id, //loggedin user id
    });
    return res.status(201).json({
      message: "Company registered successfully",
      company,
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAllcompanies = async (req, res) => {
  try {
    const userId = req.id; //loggedin user id
    const companies = await Company.find({ userId });
    if (!companies) {
      return res.status(404).json({
        message: "No companies found",
      });
    }
    return res.status(200).json({
      companies,
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};

// get company by id
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Company",
      company,
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};

//update company details
export const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { name, description, website, location, address } = req.body;
    const file = req.files;
    //cloudinary
    const updateData = { name, description, website, location, address };
    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Company updated",
      company,
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};
