// src/pages/ProfileInDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '../../components/chat/ChatWindow';
import { useNavigate } from "react-router-dom";
import BrokerProfileView from '../../components/property/BrokerProfileView';

const ProfileInDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [chatId, setChatId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();




  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`/api/roommate/profile/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log(" Profile data fetched:", data);
        setProfile(data);

        // Fetch connection status
        try {
          const statusRes = await axios.get(`/api/connections/status/${data.user._id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setConnectionStatus(statusRes.data.status);
        } catch (err) {
          // ignore
        }


      } catch (err) {
        console.error(' Error fetching profile:', err.response?.data || err.message);
        toast.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, [id, user]);



  const handleSendRequest = async () => {
    if (!profile?.user?._id) {
      return toast.error('Profile not loaded properly');
    }

    try {
      await axios.post(
        '/api/connections/send',
        { receiverId: profile.user._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Connection request sent!');
      setConnectionStatus('pending');
    } catch (err) {
      console.error('Send request error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Unable to send request');
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

  const openImageModal = (image, index) => {
    setSelectedImage({ image, index });
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const navigateImages = (direction) => {
    if (!selectedImage || !profile.images) return;

    const currentIndex = selectedImage.index;
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % profile.images.length;
    } else {
      newIndex = (currentIndex - 1 + profile.images.length) % profile.images.length;
    }

    setSelectedImage({
      image: profile.images[newIndex],
      index: newIndex
    });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;

      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowRight') {
        navigateImages('next');
      } else if (e.key === 'ArrowLeft') {
        navigateImages('prev');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedImage]);

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
              {(connectionStatus === 'connected' || connectionStatus === 'accepted') && (
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
            {/* Profile Picture (centered, no text on image) */}
            <div className="flex justify-center -mt-20 sm:-mt-24 mb-6">
              <motion.div whileHover={{ scale: 1.02 }} className="relative">
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl border-8 border-white shadow-2xl overflow-hidden bg-gray-100">
                  <img
                    src={profile.images?.[0] || '/placeholder.jpg'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>

            {/* Name & Info BELOW the image */}
            <div className="text-center px-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900"
              >
                {profile.user?.name}
              </motion.h1>
              <p className="text-lg sm:text-xl text-gray-600 mt-2 font-medium">
                {profile.occupation || 'Looking for roommate'}
              </p>
              <div className="flex flex-wrap items-center justify-center mt-4 gap-3">

                <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium text-sm sm:text-base">
                  ₹{profile.budget || '0'}/month
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mt-10 mb-6 sm:mb-8 overflow-x-auto">
              <nav className="flex justify-center space-x-4 sm:space-x-8 text-sm sm:text-base">
                {['overview', 'lifestyle', 'preferences', 'gallery'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 sm:py-4 px-1 border-b-2 font-semibold transition-all duration-300 ${activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Broker Listing Component */}
            {profile.user?._id && (
              <BrokerProfileView
                userId={profile.user._id}
                userName={profile.user.name}
                userToken={user?.token}
              />
            )}

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
                  {profile.currentProperty ? (
                    <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-amber-700 font-medium">Currently Staying At</p>
                          <p className="text-xl font-bold text-amber-900">{profile.currentProperty.title}</p>
                          <p className="text-gray-700">{profile.currentProperty.location.city}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/properties/${profile.currentProperty._id}`)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                        >
                          View PG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Not staying in any PG currently</p>
                  )}
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
                      className={`text-base sm:text-lg font-semibold ${typeof value === 'boolean'
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
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-gray-100"
                    onClick={() => openImageModal(image, index)}
                  >
                    <img
                      src={image}
                      alt={`Roommate photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
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

      {/* Image Preview Modal */}
      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl h-[70vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute -top-0 right-0 text-white hover:text-gray-300 transition-colors z-50 bg-black bg-opacity-50 rounded-full p-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {profile.images.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImages('prev')}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 sm:p-3 rounded-full transition-all duration-200 z-10"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateImages('next')}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 sm:p-3 rounded-full transition-all duration-200 z-10"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
                {selectedImage.index + 1} / {profile.images.length}
              </div>

              <div className="w-[90%] h-[70%] sm:w-[85%] sm:h-[70%] md:w-[75%] md:h-[70%] flex items-center justify-center rounded overflow-hidden">
                <img
                  src={selectedImage.image}
                  alt={`Roommate photo ${selectedImage.index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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