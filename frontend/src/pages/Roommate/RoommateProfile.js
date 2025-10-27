import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const RoommateProfile = ({ onProfileCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    budget: '',
    habits: { smoking: false, drinking: false, pets: false, cleanliness: 3 },
    vibeScore: 5
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (name in formData.habits) {
      setFormData({ ...formData, habits: { ...formData.habits, [name]: type === 'checkbox' ? checked : value } });
    } else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/roommate/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Profile saved!');
      onProfileCreated(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Your Roommate Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
        <input type="number" name="budget" placeholder="Budget" value={formData.budget} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
        <div>
          <label>Habits:</label>
          <div className="flex flex-col space-y-1">
            <label><input type="checkbox" name="smoking" checked={formData.habits.smoking} onChange={handleChange} /> Smoking</label>
            <label><input type="checkbox" name="drinking" checked={formData.habits.drinking} onChange={handleChange} /> Drinking</label>
            <label><input type="checkbox" name="pets" checked={formData.habits.pets} onChange={handleChange} /> Pets</label>
            <label>Cleanliness (1-5): <input type="number" name="cleanliness" min="1" max="5" value={formData.habits.cleanliness} onChange={handleChange} className="border px-2 py-1 ml-2 w-16" /></label>
          </div>
        </div>
        <div>
          <label>Vibe Score (1-10)</label>
          <input type="number" name="vibeScore" min="1" max="10" value={formData.vibeScore} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default RoommateProfile;
