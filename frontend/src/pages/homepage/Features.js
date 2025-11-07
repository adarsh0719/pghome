import React from "react";
import featureLeft from "../../images/featureimage1.png";
import featureRight from "../../images/featureimage2.png";

const FeatureSection = () => {
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

        {/* RIGHT IMAGE CLUSTER */}
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

        {/* LEFT IMAGE CLUSTER */}
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

          <button className="mt-8 bg-black text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition">
            Know More
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeatureSection;
