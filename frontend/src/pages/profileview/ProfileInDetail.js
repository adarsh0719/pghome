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
    <div className="min-h-screen bg-gray-50 pt-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200">
          {/* Header */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            {profile.images?.[0] && (
              <img
                src={profile.images[0]}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              {connectionStatus === 'none' && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendRequest}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Send Request
                </motion.button>
              )}
              {connectionStatus === 'pending' && (
                <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md">
                  Request Pending
                </div>
              )}
              {connectionStatus === 'accepted' && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Start Chat
                </motion.button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between -mt-20 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <div className="w-40 h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gray-100">
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
                    className="text-4xl font-bold text-gray-900"
                  >
                    {profile.user?.name}
                  </motion.h1>
                  <p className="text-xl text-gray-600 mt-2 font-medium">
                    {profile.occupation || 'Looking for roommate'}
                  </p>
                  <div className="flex items-center justify-center md:justify-start mt-3 space-x-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-sm">
                      {profile.location || 'Location not set'}
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium text-sm">
                      ₹{profile.budget || '0'}/month
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {['overview', 'lifestyle', 'preferences', 'gallery'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
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
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  {/* Bio Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">About Me</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio || "Hey! I'm looking for a compatible roommate to share an amazing living space. I believe in maintaining a clean, friendly environment where we can both feel at home."}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{profile.age || '?'}</div>
                        <div className="text-gray-600 font-medium">Age</div>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{profile.occupation ? 'Professional' : 'Student'}</div>
                        <div className="text-gray-600 font-medium">Status</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="text-xl font-bold text-blue-900">₹{profile.budget || 'Flexible'}</div>
                      <div className="text-blue-700 font-medium">Monthly Budget</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'lifestyle' && profile.habits && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {Object.entries(profile.habits).map(([key, value]) => (
                    <motion.div
                      key={key}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      <h4 className="font-semibold text-gray-800 capitalize mb-3">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <div className={`text-lg font-semibold ${
                        typeof value === 'boolean' 
                          ? value ? 'text-green-600' : 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {typeof value === 'boolean' 
                          ? value ? 'Yes' : 'No'
                          : value.toString()
                        }
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-8 border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Roommate Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium">Cleanliness</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Important</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium">Quiet Hours</span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Respected</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium">Guest Policy</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Flexible</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <span className="font-medium">Shared Expenses</span>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Fair Split</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'gallery' && profile.images && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Potential Compatibility</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-4 rounded-full bg-[#d16729]"
            ></motion.div>
          </div>
          <p className="text-gray-600 font-medium">Based on shared preferences and lifestyle</p>
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