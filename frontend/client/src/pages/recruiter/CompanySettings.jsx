import { useEffect, useState } from "react";
import API from "../../api.js";

const CompanySettings = () => {
  const [company, setCompany] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    address: "",
  });

  const [companyId, setCompanyId] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await API.get("/company/get");
        const companies = response.data.companies || [];

        if (companies.length > 0) {
          const data = companies[0];

          setCompanyId(data._id);

          setCompany({
            name: data.name || "",
            description: data.description || "",
            website: data.website || "",
            location: data.location || "",
            address: data.address || "",
          });

          if (data.logo) {
            setLogoPreview(`http://localhost:5011/uploads/${data.logo}`);
          }
        } else {
          setMessage("No company found. Please register your company first.");
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load company details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Logo size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const formData = new FormData();

      Object.entries(company).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (logo) {
        formData.append("logo", logo);
      }

      const response = await API.put(`/company/update/${companyId}`, formData);

      const updatedCompany = response.data.company;

      if (updatedCompany?.logo) {
        setLogoPreview(`http://localhost:5011/uploads/${updatedCompany.logo}`);
      }

      setLogo(null);

      setMessage(response.data.message || "Company updated successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Company update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4 text-sm">
            Loading company details...
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm text-gray-800";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-sm text-blue-600 font-semibold mb-2">
          RECRUITER SETTINGS
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Company Settings
        </h1>

        <p className="text-gray-500 mt-2 text-sm">
          Manage your company profile and public information.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
          <span>ℹ️</span>
          <p>{message}</p>
        </div>
      )}

      {companyId ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Branding */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Company Branding
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload your company logo and build your brand identity.
              </p>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-28 h-28 shrink-0 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Logo</span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">Company Logo</h3>

                <p className="text-sm text-gray-500 mt-1 mb-4">
                  JPG, PNG or WEBP. Maximum file size 2 MB.
                </p>

                <label
                  htmlFor="companyLogo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition"
                >
                  <span>↑</span>
                  Change Logo
                </label>

                <input
                  id="companyLogo"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Basic Information
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your company's basic details.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={company.name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className={inputClass}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Description *
                </label>

                <textarea
                  name="description"
                  value={company.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Tell candidates about your company..."
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website *
                </label>

                <input
                  type="url"
                  name="website"
                  value={company.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={company.location}
                  onChange={handleChange}
                  placeholder="e.g. Kolkata, India"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address *
                </label>

                <textarea
                  name="address"
                  value={company.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter complete company address"
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Save Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-gray-800">Save your changes</h3>
              <p className="text-sm text-gray-500 mt-1">
                Make sure your company information is correct.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition shadow-sm"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-gray-800">
            No Company Registered
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Please register your company before updating its details.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
