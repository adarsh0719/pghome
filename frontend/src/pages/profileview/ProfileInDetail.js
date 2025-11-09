// src/pages/ProfileInDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import ChatWindow from '../../components/chat/ChatWindow';

const ProfileInDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [chatId, setChatId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`/api/roommate/profile/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(data);

        const statusRes = await axios.get(`/api/connections/status/${data.user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setConnectionStatus(statusRes.data.status);
      } catch {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, [id, user]);

  const handleSendRequest = async () => {
    try {
      await axios.post(
        '/api/connections/send',
        { receiverId: profile.user._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Connection request sent!');
      setConnectionStatus('pending');
    } catch {
      toast.error('Unable to send request');
    }
  };

  const handleStartChat = async () => {
    try {
      const { data } = await axios.post(
        '/api/chat/create',
        { otherUserId: profile.user._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setChatId(data._id);
    } catch {
      toast.error('Unable to start chat');
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Finding your perfect roommate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200">
          {/* Header */}
          <div className="h-40 sm:h-48 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            {profile.images?.[0] && (
              <img
                src={profile.images[0]}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {connectionStatus === 'none' && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendRequest}
                  className="bg-white text-blue-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Send Request
                </motion.button>
              )}
              {connectionStatus === 'pending' && (
                <div className="bg-yellow-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-md text-center">
                  Request Pending
                </div>
              )}
              {connectionStatus === 'accepted' && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Start Chat
                </motion.button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-4 sm:px-8 pb-8">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-16 sm:-mt-20 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end space-y-3 sm:space-y-0 md:space-x-6">
                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                  <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                    <img
                      src={profile.images?.[0] || '/placeholder.jpg'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                <div className="text-center md:text-left mb-4">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl sm:text-4xl font-bold text-gray-900"
                  >
                    {profile.user?.name}
                  </motion.h1>
                  <p className="text-lg sm:text-xl text-gray-600 mt-1 sm:mt-2 font-medium">
                    {profile.occupation || 'Looking for roommate'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-xs sm:text-sm">
                      {profile.location || 'Location not set'}
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium text-xs sm:text-sm">
                      ₹{profile.budget || '0'}/month
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
              <nav className="flex space-x-4 sm:space-x-8 text-sm sm:text-base">
                {['overview', 'lifestyle', 'preferences', 'gallery'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 sm:py-4 px-1 border-b-2 font-semibold transition-all duration-300 ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
                >
                  {/* Bio Section */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      About Me
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {profile.bio ||
                        "Hey! I'm looking for a compatible roommate to share an amazing living space. I believe in maintaining a clean, friendly environment where we can both feel at home."}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                          {profile.age || '?'}
                        </div>
                        <div className="text-gray-600 font-medium text-sm sm:text-base">
                          Age
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                          {profile.occupation ? 'Professional' : 'Student'}
                        </div>
                        <div className="text-gray-600 font-medium text-sm sm:text-base">
                          Status
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                      <div className="text-lg sm:text-xl font-bold text-blue-900">
                        ₹{profile.budget || 'Flexible'}
                      </div>
                      <div className="text-blue-700 font-medium text-sm sm:text-base">
                        Monthly Budget
                      </div>
                      
                    </div>
                    <div>vdrvdr</div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'lifestyle' && profile.habits && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {Object.entries(profile.habits).map(([key, value]) => (
                    <motion.div
                      key={key}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      <h4 className="font-semibold text-gray-800 capitalize mb-2 sm:mb-3 text-sm sm:text-base">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <div
                        className={`text-base sm:text-lg font-semibold ${
                          typeof value === 'boolean'
                            ? value
                              ? 'text-green-600'
                              : 'text-red-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {typeof value === 'boolean'
                          ? value
                            ? 'Yes'
                            : 'No'
                          : value.toString()}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                    Roommate Preferences
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium text-sm sm:text-base">
                          Cleanliness
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Important
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium text-sm sm:text-base">
                          Quiet Hours
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Respected
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium text-sm sm:text-base">
                          Guest Policy
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Flexible
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium text-sm sm:text-base">
                          Shared Expenses
                        </span>
                        <span className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Fair Split
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'gallery' && profile.images && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
                >
                  {profile.images.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      <img
                        src={image}
                        alt={`Roommate photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Compatibility Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 text-center border border-gray-200"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Potential Compatibility
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-3 sm:mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-3 sm:h-4 rounded-full bg-[#d16729]"
            ></motion.div>
          </div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            Based on shared preferences and lifestyle
          </p>
        </motion.div>
      </motion.div>

      {/* Chat Window */}
      {chatId && (
        <ChatWindow
          chatId={chatId}
          receiver={profile.user}
          onClose={() => setChatId(null)}
        />
      )}
    </div>
  );
};

export default ProfileInDetail;
