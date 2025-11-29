import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FeaturesGridSection = () => {
  const [openModal, setOpenModal] = useState(null);

  return (
    <>
      {/* MAIN SECTION */}
      <div className="bg-white py-20 px-6 md:px-12 lg:px-24 xl:px-32">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">

          {/* Card 1: Safe & Secure */}
          <div className="w-full max-w-xs md:max-w-sm bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
            <h3 className="text-3xl font-black mb-6 my-16">Safe & Secure</h3>
            <p className="text-gray-800 text-base leading-relaxed mb-8">
              Your trust comes first. Every user and property is KYC-verified so you can find your perfect roommate with peace of mind.
            </p>
            <button
              onClick={() => setOpenModal("safe")}
              className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Learn More
            </button>
          </div>

          {/* Card 2: Hostels */}
          <div className="w-full max-w-xs md:max-w-sm bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center text-center -mt-6 md:-mt-0 md:-translate-y-16 shadow-lg">
            <h3 className="text-3xl font-black mb-6 mt-16">Hostels</h3>
            <p className="text-gray-800 text-base leading-relaxed mb-8">
              Discover curated PGs and co-living spaces that feel like home — verified, affordable, and comfortable.
            </p>
            <button
              onClick={() => setOpenModal("hostels")}
              className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Learn More
            </button>
          </div>

          {/* Card 3: Connect (ICON UPDATED HERE) */}
          <div className="w-full max-w-xs md:max-w-sm bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
            
            {/* Correct Original Icon */}
            <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center mb-4 mt-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M4.5 6.75a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM15 6.75a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
                <path d="M4.5 17.25a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
                <path
                  fillRule="evenodd"
                  d="M13.28 16.28a.75.75 0 000-1.06l-3.75-3.75 3.75-3.75a.75.75 0 10-1.06-1.06L8 10.69a.75.75 0 000 1.06l4.22 4.22a.75.75 0 001.06 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h3 className="text-3xl font-black mb-6">Connect</h3>
            <p className="text-gray-800 text-base leading-relaxed mb-8">
              Meet people who match your vibe. Chat, bond, and build your next home story together.
            </p>
            <button
              onClick={() => setOpenModal("connect")}
              className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Learn More
            </button>
          </div>

        </div>
      </div>

      {/* ===================== MODALS ===================== */}
      <AnimatePresence>

        {/* SAFE MODAL */}
        {openModal === "safe" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[999] p-4"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[550px] max-h-[80vh] overflow-y-auto shadow-xl"
            >
              <h2 className="text-xl md:text-2xl font-bold text-[#E28955] mb-4 text-center">
                Safe & Secure Experience
              </h2>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Your safety is our first priority...
              </p>

              <ul className="mt-4 space-y-2 text-gray-800 text-sm md:text-base">
                <li>• Verified profiles and properties</li>
                <li>• KYC checks for all users</li>
                <li>• Fake profile detection and prevention</li>
                <li>• Secure chats and protected user data</li>
              </ul>

              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setOpenModal(null)}
                  className="bg-[#E28955] text-black px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* HOSTELS MODAL */}
        {openModal === "hostels" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[999] p-4"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[550px] max-h-[80vh] overflow-y-auto shadow-xl"
            >
              <h2 className="text-xl md:text-2xl font-bold text-[#E28955] mb-4 text-center">
                Verified Hostels & PGs
              </h2>

              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Explore the best handpicked PGs and co-living spaces...
              </p>

              <ul className="mt-4 space-y-2 text-gray-800 text-sm md:text-base">
                <li>• Verified hostel listings only</li>
                <li>• Affordable rent with transparent details</li>
                <li>• Comfortable rooms and amenities</li>
                <li>• Trusted by thousands of students and professionals</li>
              </ul>

              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setOpenModal(null)}
                  className="bg-[#E28955] text-black px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* CONNECT MODAL */}
        {openModal === "connect" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[999] p-4"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[550px] max-h-[80vh] overflow-y-auto shadow-xl"
            >
              <h2 className="text-xl md:text-2xl font-bold text-[#E28955] mb-4 text-center">
                Connect With Your Perfect Match
              </h2>

              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                Matching is more than location — it's about lifestyle, habits, and comfort.
              </p>

              <ul className="mt-4 space-y-2 text-gray-800 text-sm md:text-base">
                <li>• Match by habits & lifestyle</li>
                <li>• Chat seamlessly in-app</li>
                <li>• Build real connections before deciding</li>
                <li>• Make informed and confident choices</li>
              </ul>

              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setOpenModal(null)}
                  className="bg-[#E28955] text-black px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
};

export default FeaturesGridSection;
