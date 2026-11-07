import { useEffect, useState } from "react";
import API from "../api.js";

const SERVER_URL = "http://localhost:5011";

function UpdateProfileDialog({ open, onClose }) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  // Resume states
  const [resume, setResume] = useState(null);
  const [existingResume, setExistingResume] = useState("");

  // Profile picture states
  const [profilePhoto, setProfilePhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  // General states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // Fetch profile
  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await API.get("/users/profile");
        const user = response.data?.user;

        if (!user) {
          throw new Error("User profile not found.");
        }

        setFullname(user.fullname || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phoneNumber || "");
        setBio(user.profile?.bio || "");

        const userSkills = user.profile?.skills ?? user.profile?.Skills;

        setSkills(Array.isArray(userSkills) ? userSkills.join(", ") : "");

        setExistingResume(user.resume || user.profile?.resume || "");

        setProfilePhoto(user.profile?.profilePhoto || "");

        setResume(null);
        setSelectedPhoto(null);
        setPhotoPreview("");
      } catch (error) {
        console.error("Fetch profile error:", error);

        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Could not load profile.",
        );

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [open]);

  // Handle profile picture selection
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Only JPG, PNG and WEBP images are allowed.");
      setMessageType("error");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Profile picture must not exceed 2 MB.");
      setMessageType("error");
      e.target.value = "";
      return;
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
  };

  // Upload profile picture
  const handleProfilePhotoUpload = async () => {
    if (!selectedPhoto || photoUploading) return;

    const formData = new FormData();
    formData.append("profilePicture", selectedPhoto);

    try {
      setPhotoUploading(true);
      setMessage("");

      const response = await API.post("/users/profile/picture", formData);

      const updatedUser = response.data?.user;
      const savedPhoto = updatedUser?.profile?.profilePhoto;

      if (!savedPhoto) {
        throw new Error("Profile picture filename was not returned.");
      }

      setProfilePhoto(savedPhoto);
      setSelectedPhoto(null);

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      setPhotoPreview("");

      setMessage("Profile picture updated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Profile picture upload error:", error);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload profile picture.",
      );

      setMessageType("error");
    } finally {
      setPhotoUploading(false);
    }
  };

  // Handle resume selection
  const handleResumeChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) {
      setResume(null);
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setResume(null);
      setMessage("Please select a PDF file.");
      setMessageType("error");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setResume(null);
      setMessage("PDF size must not exceed 5 MB.");
      setMessageType("error");
      e.target.value = "";
      return;
    }

    setResume(selectedFile);
    setMessage("");
  };

  // Update profile information and resume
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const formData = new FormData();

    formData.append("fullname", fullname);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("bio", bio);
    formData.append("skills", skills);

    if (resume instanceof File) {
      formData.append("resume", resume, resume.name);
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await API.post("/users/profile/update", formData);

      const user = response.data?.user;

      if (user) {
        setFullname(user.fullname || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phoneNumber || "");
        setBio(user.profile?.bio || "");

        const userSkills = user.profile?.skills ?? user.profile?.Skills;

        setSkills(Array.isArray(userSkills) ? userSkills.join(", ") : "");

        setExistingResume(user.resume || user.profile?.resume || "");
      } else if (resume) {
        const profileResponse = await API.get("/users/profile");
        const latestUser = profileResponse.data?.user;

        setExistingResume(
          latestUser?.resume || latestUser?.profile?.resume || "",
        );
      }

      setResume(null);

      setMessage(response.data?.message || "Profile updated successfully!");

      setMessageType("success");
    } catch (error) {
      console.error("Update profile error:", error);

      setMessage(
        error.response?.data?.message ||
          "Profile update failed. Please try again.",
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const resumeFileName = existingResume
    .replace(/\\/g, "/")
    .split("/uploads/")
    .pop();

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative shrink-0 border-b border-gray-100 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              👤
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Update Profile
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Keep your professional information up to date.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || photoUploading}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto px-5 py-6 sm:px-8">
          {loading ? (
            <div className="flex min-h-60 flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-sm text-gray-500">
                Loading your profile...
              </p>
            </div>
          ) : (
            <form
              id="student-profile-form"
              onSubmit={handleSubmit}
              className="space-y-7"
            >
              {/* Profile Picture */}
              <section>
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-900">
                    Profile Picture
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a professional profile photo.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:flex-row">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-blue-100 shadow-md">
                    {photoPreview || profilePhoto ? (
                      <img
                        src={
                          photoPreview ||
                          `${SERVER_URL}/uploads/${profilePhoto}`
                        }
                        alt="Student Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl text-blue-600">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-semibold text-gray-800">
                      Your Profile Photo
                    </h4>

                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG or WEBP. Maximum size 2 MB.
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                      <label
                        htmlFor="studentProfilePicture"
                        className="cursor-pointer rounded-lg border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Choose Photo
                      </label>

                      <input
                        id="studentProfilePicture"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />

                      {selectedPhoto && (
                        <button
                          type="button"
                          onClick={handleProfilePhotoUpload}
                          disabled={photoUploading}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {photoUploading ? "Uploading..." : "Upload Photo"}
                        </button>
                      )}
                    </div>

                    {selectedPhoto && (
                      <p className="mt-3 break-all text-xs text-blue-600">
                        Selected: {selectedPhoto.name}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-100" />

              {/* Personal Information */}
              <section>
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-900">
                    Personal Information
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Your basic contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className={inputClass}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={inputClass}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-100" />

              {/* About You */}
              <section>
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-900">
                    About You
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Tell recruiters about yourself and your expertise.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Professional Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Write a short introduction about yourself..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Skills</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className={inputClass}
                      placeholder="React, JavaScript, Node.js, MongoDB"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                      Separate your skills with commas.
                    </p>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-100" />

              {/* Resume */}
              <section>
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-900">Resume</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload your latest resume for recruiters.
                  </p>
                </div>

                <label
                  htmlFor="studentResume"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                    📄
                  </div>

                  <p className="text-sm font-bold text-gray-800">
                    {resume ? resume.name : "Choose your resume"}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Click to browse PDF file
                  </p>

                  <span className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
                    Browse Files
                  </span>

                  <input
                    id="studentResume"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </label>

                <p className="mt-2 text-xs text-gray-400">
                  PDF only · Maximum file size 5 MB
                </p>

                {existingResume && !resume && (
                  <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📑</span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-emerald-800">
                          Resume uploaded
                        </p>
                        <p className="truncate text-xs text-emerald-700">
                          {resumeFileName}
                        </p>
                      </div>

                      <span className="text-emerald-600">✓</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`${SERVER_URL}/uploads/${resumeFileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        View Resume
                      </a>

                      <a
                        href={`${SERVER_URL}/api/resume/download/${encodeURIComponent(
                          resumeFileName,
                        )}`}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Download Resume
                      </a>
                    </div>
                  </div>
                )}

                {resume && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="break-all text-xs font-medium text-blue-700">
                      ✓ Selected: {resume.name}
                    </p>
                    <p className="mt-1 text-xs text-blue-500">
                      Click Save Profile to upload it.
                    </p>
                  </div>
                )}
              </section>

              {/* Message */}
              {message && (
                <div
                  role="status"
                  className={`rounded-xl p-4 text-sm ${
                    messageType === "error"
                      ? "border border-red-100 bg-red-50 text-red-700"
                      : messageType === "success"
                        ? "border border-green-100 bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || photoUploading}
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="student-profile-form"
              disabled={saving || loading || photoUploading}
              className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateProfileDialog;
