import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phonenumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Student", "Recruiter"],
    default: "Student",
    required: true,
  },
  profile: {
    bio: {
      type: String,
    },
    Skills: [
      {
        type: String,
      },
    ],
    resume: {
      type: String, //url to resume file from database
    },
    resumeOriginalname:{
        type:String,   // original name of resume file
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        referance: "Company",
    },
    profilePhoto:{
        type: String, // url to profile photo file
        default:"",
    },

  }
},{timestamps: true});

export const User = mongoose.model("User", userSchema);
