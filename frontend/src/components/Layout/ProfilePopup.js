import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePopup = ({ onClose }) => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    budget: "",
    bio: "",
    images: [],
    removedIndices: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/roommate/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
        setFormData({
          name: data.user?.name || "",
          age: data.age || "",
          gender: data.gender || "",
          budget: data.budget || "",
          bio: data.bio || "",
          images: [],
          removedIndices: [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const handleRemoveExistingImage = (index) => {
    setFormData({
      ...formData,
      removedIndices: [...formData.removedIndices, index],
    });
  };

  const handleRemoveNewImage = (index) => {
    const updated = [...formData.images];
    updated.splice(index, 1);
    setFormData({ ...formData, images: updated });
  };

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("age", formData.age);
      form.append("gender", formData.gender);
      form.append("budget", formData.budget);
      form.append("bio", formData.bio);

      formData.images.forEach((img) => form.append("images", img));
      form.append("removedIndices", JSON.stringify(formData.removedIndices));

      const { data } = await axios.put("/api/roommate/profile", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(data);
      setFormData({ ...formData, images: [], removedIndices: [] });
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to update profile");
    }
  };

  if (!profile)
    return (
      <div className="fixed top-16 right-4 bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-4 w-72 border border-gray-200">
        Loading profile...
      </div>
    );

  const existingImages =
    profile.images?.filter(
      (_, idx) => !formData.removedIndices.includes(idx)
    ) || [];

  const profilePic =
    existingImages[0] ||
    profile.images?.[0] ||
    formData.images[0] ||
    "/placeholder.jpg";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 10, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        className="fixed top-16 right-4 z-50 w-72 bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl p-4"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-[#d16729] transition"
        >
          ✕
        </button>

        <div className="flex flex-col items-center space-y-2">
          <div className="relative group">
            <img
              src={profilePic}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-[#d16729]/40 group-hover:border-[#d16729] transition"
            />
            <div className="absolute bottom-0 right-0 bg-[#d16729] text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">
              {profile.gender || "?"}
            </div>
          </div>

          {!editing ? (
            <>
              <h2 className="text-base font-semibold text-gray-800">
                {profile.user?.name}
              </h2>
              <p className="text-gray-600 text-xs text-center leading-tight">
                {profile.bio || "No bio yet"}
              </p>

              <div className="w-full text-xs text-gray-700 space-y-1 mt-2 bg-gray-50 p-2 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Age:</span>
                  <span>{profile.age || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Gender:</span>
                  <span>{profile.gender || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Budget:</span>
                  <span>₹{profile.budget || "—"}</span>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-3 px-3 py-1.5 w-full bg-gradient-to-r from-[#d16729] to-[#e17837] text-white rounded-lg hover:shadow-md transition text-sm"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div className="w-full space-y-2 mt-1 text-sm">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none text-sm"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none text-sm"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none text-sm"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input
                type="number"
                name="budget"
                placeholder="Budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none text-sm"
              />
              <textarea
                name="bio"
                placeholder="Short bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-1.5 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none text-sm"
              />

              <div className="flex flex-wrap gap-2 mt-1">
                {profile.images?.map((img, idx) =>
                  formData.removedIndices.includes(idx) ? null : (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt="Existing"
                        className="w-14 h-14 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      alt="New"
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <input
                type="file"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="w-full text-xs text-gray-600"
              />

              <div className="flex justify-between mt-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-[#d16729] text-white rounded-lg hover:bg-[#b85c25] shadow-sm transition text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfilePopup;
