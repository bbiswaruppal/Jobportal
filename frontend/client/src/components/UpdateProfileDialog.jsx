import { useEffect, useState } from "react";
import API from "../api.js";

function UpdateProfileDialog({ open, onClose }) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [resume, setResume] = useState(null);
  const [existingResume, setExistingResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load existing profile whenever dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await API.get("/users/profile");
        const user = response.data.user;

        setFullname(user.fullname || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phoneNumber || "");
        setBio(user.profile?.bio || "");

        setSkills(
          Array.isArray(user.profile?.skills)
            ? user.profile.skills.join(", ")
            : ""
        );

        setExistingResume(user.resume || "");
        setResume(null);
      } catch (error) {
        console.error("Fetch profile error:", error);

        setMessage(
          error.response?.data?.message ||
            "Could not load profile. Please log in again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("bio", bio);
    formData.append("skills", skills);

    if (resume) {
      formData.append("resume", resume);
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await API.post(
        "/users/profile/update",
        formData
      );

      const user = response.data.user;

      if (user) {
        setFullname(user.fullname || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phoneNumber || "");
        setBio(user.profile?.bio || "");

        setSkills(
          Array.isArray(user.profile?.skills)
            ? user.profile.skills.join(", ")
            : ""
        );

        setExistingResume(user.resume || "");
      }

      setResume(null);
      setMessage(
        response.data.message || "Profile updated successfully!"
      );
    } catch (error) {
      console.error("Update profile error:", error);

      setMessage(
        error.response?.data?.message ||
          "Profile update failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Update Profile</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-center">Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="mb-1 block">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="mb-1 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="Tell us about yourself"
              />
            </div>

            <div>
              <label className="mb-1 block">Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="Python, React, MongoDB"
              />
            </div>

            <div>
              <label className="mb-1 block">Resume (PDF only, max 5 MB)</label>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="w-full rounded border p-2"
              />

              {existingResume && !resume && (
                <p className="mt-2 break-all text-sm text-green-700">
                  A resume is already uploaded. Select a new PDF if you want to
                  replace it.
                </p>
              )}

              {resume && (
                <p className="mt-2 break-all text-sm text-blue-700">
                  Selected file: {resume.name}. Click Save Profile to upload it.
                </p>
              )}
            </div>

            {message && (
              <p className="break-words rounded bg-gray-100 p-3 text-sm">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || loading}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Updating..." : "Save Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UpdateProfileDialog;