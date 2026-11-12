import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password } = req.body;

    // 1. Check required fields
    if (!fullname || !email || !phoneNumber || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    // 3. Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
        success: false,
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 15);

    // 5. Create new user
    const newUser = new User({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "Student",
      isSuperAdmin: false,
    });

    // 6. Save user
    await newUser.save();

    // 7. Send response
    return res.status(201).json({
      message: `Account created successfully ${fullname}`,
      success: true,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server Error registering user",
      success: false,
    });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (foundUser.role !== role) {
      return res.status(403).json({
        message: "You don't have the necessary role to access this resource",
        success: false,
      });
    }

    const token = jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const user = {
      _id: foundUser._id,
      fullname: foundUser.fullname,
      email: foundUser.email,
      phoneNumber: foundUser.phoneNumber,
      role: foundUser.role,
      isSuperAdmin: foundUser.isSuperAdmin || false,
      profile: foundUser.profile,
      resume: foundUser.resume,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "Strict",
      })
      .json({
        message: `Welcome back ${foundUser.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server Error Login failed",
      success: false,
    });
  }
};

// ==================== LOGOUT ====================
export const logout = (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", {
        maxAge: 0,
        httpOnly: true,
      })
      .json({
        message: "Logged out successfully",
        success: true,
      });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Server Error Logout",
      success: false,
    });
  }
};
// ==================== GET PROFILE ====================
export const getProfile = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Server Error Fetching Profile",
      success: false,
    });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    console.log("Received Skills:", req.body.skills);
    console.log("Received Body:", req.body);

    // Authentication middleware must set req.id
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Update basic fields
    if (fullname !== undefined && fullname.trim() !== "") {
      user.fullname = fullname.trim();
    }

    if (email !== undefined && email.trim() !== "") {
      const normalizedEmail = email.trim();

      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already exists",
          success: false,
        });
      }

      user.email = normalizedEmail;
    }

    if (phoneNumber !== undefined && phoneNumber.trim() !== "") {
      user.phoneNumber = phoneNumber.trim();
    }

    // Ensure profile object exists
    if (!user.profile) {
      user.profile = {};
    }

    if (bio !== undefined) {
      user.profile.bio = bio;
    }

    if (skills !== undefined) {
      user.profile.skills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    // Save uploaded resume path
    if (req.file) {
      user.resume = req.file.path.replace(/\\/g, "/");

      console.log("Uploaded resume path:", user.resume);
    } else {
      console.log("No resume file received");
    }

    // Save profile to MongoDB
    await user.save();

    const checkUser = await User.findById(userId).lean();

    console.log("Saved Skills in MongoDB:", checkUser?.profile?.skills);

    // Verify the saved document directly from MongoDB
    const savedUser = await User.findById(user._id).select("-password").lean();

    console.log("MongoDB saved resume:", savedUser?.resume);
    console.log("Updated user ID:", user._id.toString());

    return res.status(200).json({
      message: "Profile updated successfully",
      user: savedUser,
      success: true,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: error.message || "Server Error Updating Profile",
      success: false,
    });
  }
};

// ==================== UPDATE PROFILE PICTURE ====================

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user?._id || req._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No profile picture received",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.profile) {
      user.profile = {};
    }

    user.profile.profilePhoto = req.file.filename;

    await user.save();

    console.log("Saved Profile:", user.profile);
    console.log("Saved Profile Picture:", user.profile.profilePhoto);

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      user,
    });
  } catch (error) {
    console.error("Profile picture update error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};