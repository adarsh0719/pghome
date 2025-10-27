import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import RoommateProfile from './RoommateProfile';

const RoommateMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [profileCreated, setProfileCreated] = useState(false);

  const fetchMatches = async () => {
    try {
      const res = await axios.get('/api/roommate/matches', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const maxScore = 10 + 10 + 5 * 4 + 10; // age + budget + habits + vibeScore
      const scoredMatches = res.data.map(({ profile, compatibilityScore }) => ({
        profile,
        compatibilityScore: Math.max(0, Math.round((compatibilityScore / maxScore) * 100))
      }));

      setMatches(scoredMatches);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to fetch matches');
    }
  };

  useEffect(() => {
    if (profileCreated) fetchMatches();
    else {
      axios.get('/api/roommate/profile', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(() => setProfileCreated(true))
      .catch(() => setProfileCreated(false));
    }
  }, [profileCreated, user]);

  if (!user) return <p className="text-center mt-10">Login to see roommate matches</p>;

  if (!profileCreated) {
    return <RoommateProfile onProfileCreated={() => setProfileCreated(true)} />;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Best Roommate Matches</h2>
      {matches.length === 0 && <p className="text-center">No matches found yet.</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {matches.map(({ profile, compatibilityScore }) => {
          const stroke = 8;
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (compatibilityScore / 100) * circumference;

          return (
            <div key={profile._id} className="flex items-center bg-white rounded-xl shadow p-4 space-x-4">
              {/* Circular Score */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    className="text-gray-200"
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                  />
                  <circle
                    className="text-indigo-500 transition-all duration-500"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{compatibilityScore}%</span>
                </div>
              </div>

              {/* Profile Info */}
              <div>
                <h3 className="text-xl font-semibold">{profile.user.name}</h3>
                <p>Age: {profile.age}</p>
                <p>Budget: ₹{profile.budget}</p>
                <p>Smoking: {profile.habits.smoking ? 'Yes' : 'No'}</p>
                <p>Drinking: {profile.habits.drinking ? 'Yes' : 'No'}</p>
                <p>Pets: {profile.habits.pets ? 'Yes' : 'No'}</p>
                <p>Cleanliness: {profile.habits.cleanliness}</p>
                <p>Vibe Score: {profile.vibeScore}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoommateMatches;
