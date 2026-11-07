import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phoneNumber: {
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
      enum: ["Student", "Recruiter", "Admin"],
      default: "Student",
      required: true,
    },

    profile: {
      bio: {
        type: String,
        default: "",
      },

      skills: [
        {
          type: String,
        },
      ],

      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },

      profilePhoto: {
        type: String,
        default: "",
      },
    },

    // Resume fields at root level
    resume: {
      type: String,
      default: "",
    },

    resumeOriginalname: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);