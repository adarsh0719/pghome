import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import RoommateProfile from './RoommateProfile';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../homepage/Footer';
import { useNavigate } from 'react-router-dom';
import MyConnections from "./MyConnections";



// 📌 Haversine distance function
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};


const RoommateMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [profileCreated, setProfileCreated] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [connectedUserIds, setConnectedUserIds] = useState([]);

  // Swipe & UI states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const cardRef = useRef(null);

  const currentMatch = matches[currentIndex] || null;
  const currentImages = currentMatch?.profile?.images || [];
const [mobileShowConnections, setMobileShowConnections] = useState(false);

  

  const updateMyLocation = async () => {
    if (!user) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        await axios.put(
          "/api/roommate/update-coordinates",
          { latitude, longitude },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } catch (err) {
        console.error("Failed to update coordinates:", err);
      }
    });
  };

  useEffect(() => {
    if (user) updateMyLocation();
  }, [user]);


  // -------------------------------------------
  // 🟦 Fetch connected users
  // -------------------------------------------
  const fetchConnectedUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/connections/connections", {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const ids = data.map(conn => conn.otherUser?._id);
      setConnectedUserIds(ids);
    } catch (err) {
      console.error("Failed to fetch connected users", err);
    }
  }, [user]);


  // -------------------------------------------
  // 🟦 Fetch my profile
  // -------------------------------------------
  const fetchProfile = useCallback(async () => {
    if (!user) return setProfileCreated(false);

    try {
      const { data } = await axios.get("/api/roommate/profile", {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setMyProfile(data);
      setProfileCreated(true);

    } catch {
      setProfileCreated(false);
    }
  }, [user]);


  // Fetch profile + connections on mount
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchConnectedUsers();
    }
  }, [user, fetchProfile, fetchConnectedUsers]);


  // -------------------------------------------
  // 🟦 Fetch matches (pagination)
  // -------------------------------------------
  const fetchMatches = useCallback(async (nextPage = 1) => {
    if (!user || !myProfile || !hasMore) return;

    setLoading(true);

    try {
      const { data } = await axios.get(
        `/api/roommate/matches?page=${nextPage}&limit=10`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const filtered = data.results
        .map(m => {
          const p = m.profile;
          const myLat = myProfile?.coordinates?.coordinates?.[1];
          const myLng = myProfile?.coordinates?.coordinates?.[0];
          const theirLat = p?.coordinates?.coordinates?.[1];
          const theirLng = p?.coordinates?.coordinates?.[0];
          const distance = getDistance(myLat, myLng, theirLat, theirLng);
          return { ...m, distance };
        })
        .filter(m => !connectedUserIds.includes(m.profile?.user?._id));

      setMatches(prev => [...prev, ...filtered]);
      setHasMore(data.hasMore);
      setPage(nextPage);

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to fetch matches');
    }

    setLoading(false);

  }, [user, myProfile, connectedUserIds, hasMore]);


  // Load first matches after profile is ready
  useEffect(() => {
    if (profileCreated && myProfile) {
      fetchMatches(1);
    }
  }, [profileCreated, myProfile, fetchMatches]);


  // Reset image index on new match
  useEffect(() => {
    setImageIndex(0);
  }, [currentIndex]);



  // -------------------------------------------
  // 🟦 Swipe Logic
  // -------------------------------------------
  const handleCardExit = (dir) => {
    setExitX(dir === 'right' ? 600 : -600);
    setDirection(dir === 'right' ? 1 : -1);

    setTimeout(() => {
      const nextIndex = currentIndex + 1;

      // Load next page if we reach near end
      if (nextIndex >= matches.length - 2 && hasMore) {
        fetchMatches(page + 1);
      }

      setCurrentIndex(nextIndex % matches.length);
      setExitX(0);
      setImageIndex(0);
    }, 250);
  };


  const handleDragEnd = (_, info) => {
    if (!currentMatch) return;
    if (Math.abs(info.offset.x) > 100) {
      handleCardExit(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  const handleSwipe = (dir) => {
    if (currentMatch) handleCardExit(dir);
  };

  const handleCardClick = () => {
    if (currentMatch?.profile?.user?._id) {
      navigate(`/profile/${currentMatch.profile.user._id}`);
    }
  };


  // -------------------------------------------
  // 🟦 Like / Send Request
  // -------------------------------------------
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


  // -------------------------------------------
  // 🟦 Formatting Helper
  // -------------------------------------------
  const formatAgeAndGender = (profile) => {
    const age = profile.age || 'N/A';
    const gender = profile.gender ? `, ${profile.gender.charAt(0).toUpperCase()}` : '';
    return `${age}${gender}`;
  };


  // -------------------------------------------
  // 🟦 Required returns before JSX
  // -------------------------------------------
  if (!user) return <p className="text-center mt-10">Login to see roommate matches</p>;
  if (profileCreated === null) return <p className="text-center mt-10">Checking profile...</p>;
  if (!profileCreated) return <RoommateProfile onProfileCreated={() => setProfileCreated(true)} />;
  return (
    <div className="min-h-screen  flex flex-col">
      <div className="flex flex-col lg:flex-row w-full flex-grow pt-24">
        {mobileShowConnections ? (
    <div className="lg:hidden w-full p-4">
      <div className="bg-white rounded-3xl shadow-xl p-4">
        <MyConnections />
      </div>
    </div>
  ) : (
    <div className="lg:hidden flex-1 flex flex-col items-center justify-center px-6 pb-10">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center">
  <div className="text-center mt-4 mb-6">
    <h1 className="text-3xl font-bold text-amber-700 mb-2">Find Your Roommate</h1>
    <p className="text-gray-700">Swipe right to like, left to pass</p>
  </div>

  <div className="relative w-full h-[70vh] flex items-center justify-center">
    {loading ? (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">This may take a few moments — hang tight!</p>
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
          >
            <div className="w-full h-3/5 relative rounded-xl overflow-hidden">

  {/* === IMAGE / SLIDER === */}
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
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      No photos available
    </div>
  )}

  {/* === MATCH SCORE BADGE === */}
  <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full shadow-lg">
    <span className="font-bold text-amber-600 text-sm">
      {currentMatch.compatibilityScore}% Match
    </span>
  </div>

  {/* === AVAILABLE ROOMS BADGE (Fixed Position) === */}
  {currentMatch.profile.availableRooms > 0 && (
    <div className="absolute top-4 right-4 bg-green-600/90 backdrop-blur-md px-4 py-1.5 rounded-lg shadow-md flex items-center gap-2 border border-white/20">
      <span className="text-white text-sm font-medium">
        {currentMatch.profile.availableRooms} Room
        {currentMatch.profile.availableRooms > 1 ? "s" : ""} Available
      </span>
    </div>
  )}

  {/* === BOTTOM GRADIENT DETAILS === */}
  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">

    <h2 className="text-2xl font-bold text-white mb-1">
      {currentMatch.profile.user?.name}
      {formatAgeAndGender(currentMatch.profile)}
    </h2>

    <div className="flex items-center space-x-4 text-white/90 text-sm">
      <span>
        {currentMatch.distance !== null
          ? `${currentMatch.distance} km away`
          : "Distance unavailable"}
      </span>

      <span>
        ₹{currentMatch.profile.budget || "N/A"}/month
      </span>
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
      <div className="text-center text-gray-600 bg-white rounded-3xl p-10 shadow-xl">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold mb-2">No matches found</h3>
        <p className="mb-6 text-gray-500">We couldn’t find any roommates that match your preferences.</p>
        <button
          onClick={() => setProfileCreated(false)}
          className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold text-lg hover:bg-amber-600 shadow-lg"
        >
          Update Preferences
        </button>
      </div>
    )}
  </div>

  {matches.length > 0 && (
    <div className="w-full max-w-sm flex justify-around items-center mt-6">
      <button
        className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center"
        onClick={() => handleSwipe('left')}
        disabled={loading || !currentMatch}
      >
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center"
        onClick={() => handleLike(currentMatch?.profile?.user?._id)}
        disabled={loading || !currentMatch}
      >
        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )}
</div>

    </div>
  )}
        {/* Left: Match Section */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-6">
          <div className="text-center mt-4 mb-8">
            <h1 className="text-4xl font-bold text-amber-700 mb-2">Find Your Roommate</h1>
            <p className="text-gray-700 text-lg">Swipe right to like, left to pass</p>
          </div>

          <div className="relative w-full max-w-sm h-[75vh] flex items-center justify-center">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-lg">This may take a few moments — hang tight!</p>
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
                    <div className="w-full h-3/5 relative rounded-xl overflow-hidden">
  {/* === IMAGE / SLIDER === */}
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

  {/* === MATCH SCORE BADGE === */}
  <div className="absolute top-4 left-4 bg-white/95 px-4 py-2 rounded-full shadow-xl backdrop-blur-sm border border-gray-200">
    <span className="font-semibold text-amber-600 text-sm">
      {currentMatch.compatibilityScore}% Match
    </span>
  </div>

  {/* === AVAILABLE ROOMS BADGE === */}
  {/* AVAILABLE ROOMS BADGE */}
{currentMatch.profile.lookingForRoommate &&
  currentMatch.profile.availableRooms > 0 && (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl border border-green-500/30 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
      <span className="text-green-700 font-semibold text-sm tracking-wide">
        {currentMatch.profile.availableRooms} Room
        {currentMatch.profile.availableRooms > 1 ? "s" : ""} Available
      </span>
    </div>
  )}


  {/* === BOTTOM DETAILS GRADIENT BAR === */}
  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6">

    <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
      {currentMatch.profile.user?.name}
      {formatAgeAndGender(currentMatch.profile)}
    </h2>

    <div className="flex items-center space-x-6 text-white/90 text-base">

      {/* Distance */}
      <span>
        {currentMatch.distance !== null
          ? `${currentMatch.distance} km away`
          : "Distance unavailable"}
      </span>

      {/* Budget */}
      <span className="font-medium">
        ₹{currentMatch.profile.budget || "N/A"}/month
      </span>
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

       <div className="hidden lg:block w-1/3 border-l p-6">
  <div className="bg-white rounded-3xl shadow-xl p-4">
    <MyConnections />
  </div>
</div>


        
      </div>
      {/* MOBILE ONLY SWITCH BUTTON */}
<div className="lg:hidden fixed bottom-6 right-6 z-50">
  <button
    onClick={() => setMobileShowConnections(!mobileShowConnections)}
    className="bg-amber-600 text-white px-5 py-3 rounded-full shadow-xl font-semibold"
  >
    {mobileShowConnections ? "Back to Matches" : "My Connections"}
  </button>
</div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RoommateMatches;
