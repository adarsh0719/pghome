import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import RoommateProfile from './RoommateProfile';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../homepage/Footer';
import { useNavigate } from 'react-router-dom';
import ReceivedRequests from './ReceivedRequests';



const RoommateMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [profileCreated, setProfileCreated] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const currentMatch = matches[currentIndex] || null;
  const currentImages = currentMatch?.profile?.images || [];

  

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!user) return setProfileCreated(false);
    try {
      await axios.get('/api/roommate/profile', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfileCreated(true);
    } catch {
      setProfileCreated(false);
    }
  }, [user]);

  //  Fetch matches
  const fetchMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get('/api/roommate/matches', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMatches(data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) fetchProfile(); }, [user, fetchProfile]);
  useEffect(() => { if (profileCreated) fetchMatches(); }, [profileCreated, fetchMatches]);
  useEffect(() => { setImageIndex(0); }, [currentIndex]);

  // Swipe logic
  const handleCardExit = (dir) => {
    setExitX(dir === 'right' ? 600 : -600);
    setDirection(dir === 'right' ? 1 : -1);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % matches.length);
      setExitX(0);
      setImageIndex(0);
    }, 250);
  };

  const handleDragEnd = (_, info) => {
    if (!currentMatch) return;
    if (Math.abs(info.offset.x) > 100) handleCardExit(info.offset.x > 0 ? 'right' : 'left');
  };

  const handleSwipe = (dir) => { if (currentMatch) handleCardExit(dir); };

  const handleCardClick = () => {
    if (currentMatch?.profile?.user?._id) {
      navigate(`/profile/${currentMatch.profile.user._id}`);
    }
  };

  const handleLike = async (matchUserId) => {
    handleSwipe('right');
    try {
      await axios.post(
        '/api/connections/send',
        { receiverId: matchUserId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Connection request sent!');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to send request');
    }
  };

  const formatAgeAndGender = (profile) => {
    const age = profile.age || 'N/A';
    const gender = profile.gender ? `, ${profile.gender.charAt(0).toUpperCase()}` : '';
    return `${age}${gender}`;
  };

  if (!user) return <p className="text-center mt-10">Login to see roommate matches</p>;
  if (profileCreated === null) return <p className="text-center mt-10">Checking profile...</p>;
  if (!profileCreated) return <RoommateProfile onProfileCreated={() => setProfileCreated(true)} />;

  return (
    <div className="min-h-screen  flex flex-col">
      <div className="flex flex-col lg:flex-row w-full flex-grow pt-24">
        {/* Left: Match Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center mt-4 mb-8">
            <h1 className="text-4xl font-bold text-amber-700 mb-2">Find Your Roommate</h1>
            <p className="text-gray-700 text-lg">Swipe right to like, left to pass</p>
          </div>

          <div className="relative w-full max-w-sm h-[75vh] flex items-center justify-center">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-lg">Finding perfect roommates...</p>
              </div>
            ) : matches.length > 0 ? (
              <AnimatePresence mode="wait">
                {currentMatch && (
                  <motion.div
                    key={currentMatch.profile._id}
                    className="absolute w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-pointer flex flex-col"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    onClick={handleCardClick}
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{
                      x: exitX,
                      rotate: direction * 25,
                      opacity: 0,
                      scale: 0.85,
                      transition: { duration: 0.4 }
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    ref={cardRef}
                  >
                    <div className="w-full h-3/5 relative">
                      {currentImages.length > 0 ? (
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentImages[imageIndex]}
                            src={currentImages[imageIndex]}
                            alt="Roommate"
                            className="w-full h-full object-cover absolute inset-0"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                          />
                        </AnimatePresence>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                          No photos available
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full shadow-lg">
                        <span className="font-bold text-amber-600 text-sm">{currentMatch.compatibilityScore}% Match</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                        <h2 className="text-3xl font-bold text-white mb-1">
                          {currentMatch.profile.user?.name}{formatAgeAndGender(currentMatch.profile)}
                        </h2>
                        <div className="flex items-center space-x-6 text-white/90 text-base">
                          <span>{currentMatch.profile.location || 'Location not specified'}</span>
                          <span>₹{currentMatch.profile.budget || 'N/A'}/month</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-center">
                      <p className="text-base text-gray-700 leading-relaxed text-center">
                        {currentMatch.profile.bio || 'No bio provided'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="text-center text-gray-600 bg-white rounded-3xl p-12 shadow-2xl max-w-md mx-auto">
                <div className="text-7xl mb-6">🏠</div>
                <h3 className="text-2xl font-semibold mb-3">No matches found</h3>
                <p className="mb-8 text-gray-500 text-lg">We couldn’t find any roommates that match your preferences.</p>
                <button
                  onClick={() => setProfileCreated(false)}
                  className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-amber-600 shadow-lg"
                >
                  Update Preferences
                </button>
              </div>
            )}
          </div>

          {/*  Action Buttons */}
          {matches.length > 0 && (
            <div className="w-full max-w-sm flex justify-around items-center mt-8 pb-32">
              <button
                className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center hover:shadow-3xl"
                onClick={() => handleSwipe('left')}
                disabled={loading || !currentMatch}
              >
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center hover:shadow-3xl"
                onClick={() => handleLike(currentMatch?.profile?.user?._id)}
                disabled={loading || !currentMatch}
              >
                <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Right: Connection Requests */}
        <div className="hidden lg:block w-1/3 pr-8 pt-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Connection Requests</h2>
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <ReceivedRequests />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RoommateMatches;
