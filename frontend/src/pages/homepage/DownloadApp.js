import React from 'react';

const FeaturesGridSection = () => {
  return (
    <div className="bg-white py-20 px-6 md:px-12 lg:px-24 xl:px-32">
      <div className="flex flex-col md:flex-row items-center justify-center gap-12">
        {/* Card 1: Safe & Secure */}
        <div className="w-full max-w-xs md:max-w-sm bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-black mb-6 my-16">Safe & Secure</h3>
          <p className="text-gray-800 text-base leading-relaxed mb-8">
            Your trust comes first. Every user and property is KYC-verified so you can find your perfect roommate with total peace of mind.
          </p>
          <button className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors">
            Learn More
          </button>
        </div>

        {/* Card 2: Hostels — LIFTED */}
        <div className="w-full max-w-xs md:max-w-sm bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center text-center -mt-6 md:-mt-0 md:-translate-y-16 shadow-lg">
          <h3 className="text-3xl font-black mb-6 mt-16">Hostels</h3>
          <p className="text-gray-800 text-base leading-relaxed mb-8">
            Discover curated PGs and co-living spaces that feel like home, affordable and verified.
          </p>
          <button className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors">
            Learn More
          </button>
        </div>

        {/* Card 3: Connect */}
        <div className="w-full max-w-xs md:max-w-sm bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
          {/* Orange Icon */}
          <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center mb-4 mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ">
              <path d="M4.5 6.375a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM14.25 6.375a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM4.5 18a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zm14.25-2.25a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
              <path d="M19.5 12.75l-7.5 7.5v-7.5h-7.5v-3h7.5v-7.5l7.5 7.5h7.5v3h-7.5z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black mb-6">Connect</h3>
          <p className="text-gray-800 text-base leading-relaxed mb-8">
            Meet people who match your vibe. Chat, bond, and build your next home story together.
          </p>
          <button className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesGridSection;