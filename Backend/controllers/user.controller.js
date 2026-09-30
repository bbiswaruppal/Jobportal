import User from "../models/user.model,js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(404).json({
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "Email already exists",
        success: false,
      });
    }
    // convert passwords to hashes
    const hashedPassword = await bcrypt.hash(password, 15);

    const newUser = new User({
      fullname,
      email,
      phoneNumber,
      Password: hashedPassword,
      role,
    });

    return res.status(200).json({
      message: `Account created successfully ${fullname}`,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(404).json({
        message: "Missing required fields",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(404).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    //check role correctly or not

    if (user.role !== role) {
      return res.status(403).json({
        message: "You don't have the necessary role to access this resources",
        success: false,
      });
    }
    //generate token

    const tokendata = {
      userId: user._id,
    };
    const token = await jwt.sign(tokendata, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: strict,
      })
      .json({
        message: `Welcome back $(user.fullname)`,
        user,
        success: true,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};


// Log out section

export const logout = (req, res) => {
  try {
    
  } catch (error) {
    
  }
}