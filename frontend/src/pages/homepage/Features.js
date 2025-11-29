import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import featureLeft from "../../images/featureimage1.png";
import featureRight from "../../images/featureimage2.png";

const FeatureSection = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <section className="relative bg-white overflow-hidden py-24 px-6 md:px-12 lg:px-20 font-['Poppins']">
      
      {/* --- TOP SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* LEFT TEXT */}
        <div>
          <h1 className="text-[42px] md:text-[60px] font-extrabold leading-tight text-black">
            There’s always<br />
            <span className="text-[#E28955]">someone</span> that<br />
            gets you.
          </h1>

          <p className="mt-5 text-lg text-gray-700 max-w-md">
            Everyone deserves that someone makes their life easier. And so do you :)
          </p>

          <button className="mt-8 bg-[#E28955] text-black px-6 py-3 rounded-lg font-semibold shadow hover:shadow-md transition">
            Download the App
          </button>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center md:justify-end relative">
          <img
            src={featureRight}
            alt="friends on phone"
            className="w-[380px] md:w-[480px] lg:w-[520px] object-contain"
          />
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-28">

        {/* LEFT IMAGE */}
        <div className="flex justify-center md:justify-start">
          <img
            src={featureLeft}
            alt="friends gaming and guitar"
            className="w-[420px] md:w-[520px] lg:w-[580px] object-contain"
          />
        </div>

        {/* RIGHT TEXT */}
        <div className="text-left md:text-right">
          <h2 className="text-[42px] md:text-[60px] font-extrabold leading-tight text-black">
            <span className="text-[#E28955]">Hobbies</span> that<br />
            match
          </h2>

          <p className="mt-5 text-lg text-gray-700 max-w-md ml-0 md:ml-auto">
            Love gaming or playing guitar? Search by interests and find your perfect vibe.
          </p>

          <button
            onClick={() => setOpenModal(true)}
            className="mt-8 bg-black text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition"
          >
            Know More
          </button>
        </div>
      </div>

      {/* --- MODAL --- */}
     <AnimatePresence>
  {openModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[999] p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="
          bg-white rounded-2xl p-6 md:p-8 
          w-full max-w-[600px] mt-14
          max-h-[80vh] overflow-y-auto shadow-xl
        "
      >
        <h2 className="text-xl md:text-2xl font-bold text-[#E28955] mb-3 text-center">
          Find People Who Share Similar Interests
        </h2>

        <p className="text-gray-700 leading-relaxed text-base md:text-lg">
          Matching goes beyond location. With interest-based matching, you connect with
          people who genuinely share the same energy, whether it's creativity, sports,
          music, games, or lifestyle habits.
        </p>

        <ul className="mt-4 space-y-2 text-gray-800 text-sm md:text-base">
          <li>• People who enjoy gaming sessions</li>
          <li>• Music lovers or guitar players</li>
          <li>• Fitness and workout partners</li>
          <li>• Study or productivity-focused companions</li>
          <li>• Content creation and photography enthusiasts</li>
        </ul>

        <p className="mt-4 text-gray-700 text-base md:text-lg">
          The right match can make daily life much more comfortable, positive, and enjoyable.
        </p>

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setOpenModal(false)}
            className="bg-[#E28955] text-black px-6 py-2 rounded-full font-semibold hover:opacity-90 transition text-sm md:text-base"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </section>
  );
};

export default FeatureSection;
