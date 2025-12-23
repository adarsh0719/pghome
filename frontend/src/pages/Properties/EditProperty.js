import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const EditProperty = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pg",
    rent: "",
    securityDeposit: "",
    location: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    amenities: [],
    rules: [],
    liveViewAvailable: false,
    videoUrl: "",
    vacancies: {
      single: 0,
      double: 0
    },
    packages: []
  });

  const amenitiesList = ["WiFi", "AC", "Food", "Laundry", "Parking", "Security", "Gym", "Pool", "TV", "Refrigerator"];
  const rulesList = ["No Smoking", "No Pets", "No Parties", "No Guests", "No Alcohol", "Curfew Time"];

  // Load property details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/properties/${id}`);
        const prop = res.data;

        setFormData({
          title: prop.title || "",
          description: prop.description || "",
          type: prop.type || "pg",
          rent: prop.rent || "",
          securityDeposit: prop.securityDeposit || "",
          location: {
            address: prop.location?.address || "",
            city: prop.location?.city || "",
            state: prop.location?.state || "",
            pincode: prop.location?.pincode || "",
            landmark: prop.location?.landmark || "",
          },
          amenities: prop.amenities || [],
          rules: prop.rules || [],
          liveViewAvailable: prop.liveViewAvailable || false,
          videoUrl: prop.videoUrl || "",
          vacancies: {
            single: prop.vacancies?.single || 0,
            double: prop.vacancies?.double || 0
          },
          packages: prop.packages ? prop.packages.map(p => ({
            ...p,
            amenities: Array.isArray(p.amenities) ? p.amenities.join(', ') : p.amenities
          })) : []
        });

        setExistingImages(prop.images || []);
      } catch (err) {
        toast.error("Failed to load property details");
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // Image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    const previews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (publicId) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index].preview);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Form field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("location[")) {
      const key = name.match(/location\[(.*)\]/)[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
      return;
    }

    if (name.startsWith("vacancies.")) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        vacancies: { ...prev.vacancies, [key]: parseInt(value) || 0 },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleRule = (rule) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter((r) => r !== rule)
        : [...prev.rules, rule],
    }));
  };

  // --- Package Handlers ---
  const handleAddPackage = () => {
    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, { name: '', price: '', amenities: '' }]
    }));
  };

  const handleRemovePackage = (index) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index)
    }));
  };

  const handlePackageChange = (index, field, value) => {
    setFormData(prev => {
      const newPackages = [...prev.packages];
      newPackages[index] = { ...newPackages[index], [field]: value };
      return { ...prev, packages: newPackages };
    });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Process packages
      const refinedPackages = formData.packages.map(pkg => ({
        ...pkg,
        price: Number(pkg.price),
        amenities: typeof pkg.amenities === 'string'
          ? pkg.amenities.split(',').map(a => a.trim()).filter(a => a)
          : pkg.amenities
      })).filter(pkg => pkg.name && pkg.price);

      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("type", formData.type);
      submitData.append("rent", formData.rent);
      submitData.append("securityDeposit", formData.securityDeposit || "0");
      submitData.append("liveViewAvailable", formData.liveViewAvailable);
      submitData.append("videoUrl", formData.videoUrl);
      submitData.append("vacancies[single]", formData.vacancies.single);
      submitData.append("vacancies[double]", formData.vacancies.double);

      // Location fields
      submitData.append("location[address]", formData.location.address);
      submitData.append("location[city]", formData.location.city);
      submitData.append("location[state]", formData.location.state);
      submitData.append("location[pincode]", formData.location.pincode);
      submitData.append("location[landmark]", formData.location.landmark);

      submitData.append("amenities", JSON.stringify(formData.amenities));
      submitData.append("rules", JSON.stringify(formData.rules));
      submitData.append("existingImages", JSON.stringify(existingImages));
      submitData.append("packages", JSON.stringify(refinedPackages));

      newImages.forEach((img) => submitData.append("images", img));

      await axios.put(`/api/properties/${id}`, submitData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      toast.success("Property updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update property");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Property</h1>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Title & Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Cozy PG near University"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="pg">PG</option>
                  <option value="flat">Flat</option>
                  <option value="room">Room</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Describe your property in detail..."
              />
            </div>

            {/* Pricing */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹) *</label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., 8000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (₹)</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., 10000 (optional)"
                />
              </div>
            </div>



            {/* Packages Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Packages</h3>
              <p className="text-gray-500 text-sm mb-4">
                Define different packages (e.g., Basic, Premium) with specific prices and amenities.
              </p>

              <div className="space-y-4 mb-6">
                {formData.packages.map((pkg, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                          placeholder="e.g. Premium Single"
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹/mo)</label>
                        <input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                          placeholder="e.g. 8000"
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />

                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                      <input
                        type="text"
                        value={pkg.amenities}
                        onChange={(e) => handlePackageChange(index, 'amenities', e.target.value)}
                        placeholder="e.g. AC, Attached Washroom, TV"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddPackage}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition"
              >
                + Add Package (Optional)
              </button>
            </div>

            {/* Vacancies */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Single Room Vacancies</label>
                <input
                  type="number"
                  min="0"
                  name="vacancies.single"
                  value={formData.vacancies.single}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Double Room Vacancies</label>
                <input
                  type="number"
                  min="0"
                  name="vacancies.double"
                  value={formData.vacancies.double}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                <input
                  type="text"
                  name="location[address]"
                  value={formData.location.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="House no., street, area"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="location[city]"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    name="location[state]"
                    value={formData.location.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="location[pincode]"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., 110001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                <input
                  type="text"
                  name="location[landmark]"
                  value={formData.location.landmark}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Near XYZ Mall"
                />
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((img) => (
                    <div key={img.publicId} className="relative group">
                      <img src={img.url} alt="Property" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.publicId)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Add More Images</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="new-images"
                />
                <label
                  htmlFor="new-images"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-md border inline-block"
                >
                  Choose Images
                </label>
                <p className="text-sm text-gray-500 mt-2">Max 5MB each • JPG, PNG</p>

                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {newPreviews.map((prev, i) => (
                      <div key={i} className="relative group">
                        <img src={prev.preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video & Live View */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Video Tour</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (YouTube, etc.)</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://youtube.com/embed/..."
                />
              </div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="liveViewAvailable"
                  checked={formData.liveViewAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-gray-700">Live Video View Available</span>
              </label>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div>
              <h3 className="text-lg font-semibold mb-4">House Rules</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {rulesList.map((rule) => (
                  <label key={rule} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rules.includes(rule)}
                      onChange={() => toggleRule(rule)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{rule}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#d16729] hover:bg-[#db611a] text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating Property..." : "Update Property"}
              </button>
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#d16729] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">Uploading: {uploadProgress}%</p>
              </div>
            )}
          </form>
        </div>
      </div >
    </div >
  );
};

export default EditProperty;