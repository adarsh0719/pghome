// src/components/landing/LandingPage.jsx
import React from "react";
import Navbar from "../../components/Layout/Navbar"; // Import your reusable navbar
import "./LandingPage.css";
import landing1 from "../../images/landing1.jpeg";
import landing2 from "../../images/landing2.jpeg";
import landing3 from "../../images/landing3.jpeg";
import landing4 from "../../images/landing4.jpeg";
const cards = [
  {
    name: "Sakshi",
    img: landing1
  },
  {
    name: "Jahnvi",
    img: landing2,
  },
  {
    name: "Anjali",
    img: landing3,
  },
  {
    name: "Aditi",
    img: landing4,
  },
];

const LandingPage = () => {
  return (
    <>
      {/* Use the reusable Navbar */}
      <Navbar />

      {/* MAIN WRAPPER */}
      <div className="landing-wrapper">
        <h1 className="landing-title">Roommate</h1>

        <div className="landing-carousel" role="presentation">
          {cards.map((card, index) => (
            <div
              key={index}
              className="landing-card"
              style={{ "--delay": `${index * 3}s` }}
            >
              <img src={card.img} alt={card.name} />
              <div className="landing-overlay">
                {card.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LandingPage;
