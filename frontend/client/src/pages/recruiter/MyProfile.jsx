import { useEffect, useState } from "react";
import API from "../../api.js";

const MyProfile = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    bio: "",
    skills: "",
  });

  const [resume, setResume] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [savedPicture, setSavedPicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingPicture, setSavingPicture] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState("");

  const getPictureUrl = (picture) => {
    if (!picture) return "";

    if (picture.startsWith("http")) return picture;

    return `http://localhost:5011/uploads/${picture}`;
  };

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/users/profile");
        const user = response.data.user;

        setFormData({
          fullname: user.fullname || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          bio: user.profile?.bio || "",
          skills: user.profile?.skills?.join(", ") || "",
        });

        const picture = user.profile?.profilePhoto || "";

        setSavedPicture(picture);
        setPicturePreview(getPictureUrl(picture));
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Select profile picture
  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Profile picture must be smaller than 2MB.");
      e.target.value = "";
      return;
    }

    setMessage("");
    setProfilePicture(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  // Upload profile picture
  const handlePictureUpload = async () => {
    if (!profilePicture) {
      setMessage("Please select a profile picture first.");
      return;
    }

    try {
      setSavingPicture(true);
      setMessage("");

      const data = new FormData();
      data.append("profilePicture", profilePicture);

      const response = await API.post("/users/profile/picture", data);

      if (response.data.success) {
        const picture = response.data.profilePicture;

        setSavedPicture(picture);
        setPicturePreview(getPictureUrl(picture));
        setProfilePicture(null);

        setMessage("Profile picture uploaded successfully!");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Profile picture upload failed.",
      );
    } finally {
      setSavingPicture(false);
    }
  };

  // Update basic profile and resume
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setMessage("");

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (resume) {
        data.append("resume", resume);
      }

      const response = await API.post("/users/profile/update", data);

      setMessage(response.data.message || "Profile updated successfully!");

      setResume(null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl bg-white p-6 shadow-md md:p-8">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">My Profile</h2>

        <p className="mb-6 text-gray-500">
          Manage your personal information and profile picture.
        </p>

        {message && (
          <p className="mb-4 rounded-lg bg-blue-50 p-3 text-blue-700">
            {message}
          </p>
        )}

        {/* Profile Picture Section */}
        <div className="mb-8 rounded-xl border border-gray-200 p-5">
          <h3 className="mb-5 text-lg font-semibold text-gray-800">
            Profile Picture
          </h3>

          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Image Preview */}
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-blue-100 bg-blue-600 text-4xl font-bold text-white">
              {picturePreview ? (
                <img
                  src={picturePreview}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                formData.fullname.charAt(0).toUpperCase() || "R"
              )}
            </div>

            <div className="w-full">
              <label className="mb-2 block font-medium text-gray-700">
                Choose Profile Picture
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePictureChange}
                className="w-full rounded-lg border p-3 text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or WEBP. Maximum size: 2MB.
              </p>

              <button
                type="button"
                onClick={handlePictureUpload}
                disabled={!profilePicture || savingPicture}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPicture ? "Uploading..." : "Upload Picture"}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Upload Resume</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="w-full rounded-lg border p-3"
            />
            <p className="mt-1 text-xs text-gray-500">
              PDF only. Maximum size: 5MB.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
