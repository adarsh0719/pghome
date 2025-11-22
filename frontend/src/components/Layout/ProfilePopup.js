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
    image: null,
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
          image: null,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImageChange = (e) => setFormData({ ...formData, image: e.target.files[0] });

  const handleSave = async () => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && form.append(k, v));

      const { data } = await axios.put("/api/roommate/profile", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(data);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to update profile");
    }
  };

  if (!profile)
    return (
      <div className="fixed top-16 right-4 bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 w-80 border border-gray-200">
        Loading profile...
      </div>
    );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        className="fixed top-16 right-4 z-50 w-80 bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-[#d16729] transition"
        >
          ✕
        </button>

        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <img
              src={profile.images?.[0] || "/placeholder.jpg"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#d16729]/40 group-hover:border-[#d16729] transition"
            />
            <div className="absolute bottom-0 right-0 bg-[#d16729] text-white text-xs px-2 py-1 rounded-full shadow">
              {profile.gender || "?"}
            </div>
          </div>

          {!editing ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800">{profile.user?.name}</h2>
              <p className="text-gray-600 text-sm text-center">
                {profile.bio || "No bio yet"}
              </p>
              <div className="w-full text-sm text-gray-700 space-y-2 mt-3 bg-gray-50 p-3 rounded-lg">
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
                className="mt-4 px-4 py-2 w-full bg-gradient-to-r from-[#d16729] to-[#e17837] text-white rounded-lg hover:shadow-lg transition"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div className="w-full space-y-3 mt-2">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none"
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none"
              />
              <textarea
                name="bio"
                placeholder="Short bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#d16729]/60 outline-none"
              />
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600"
              />

              <div className="flex justify-between mt-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#d16729] text-white rounded-lg hover:bg-[#b85c25] shadow-sm transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
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
