// src/components/landing/LandingPage.jsx
import React from "react";
import Navbar from "../../components/Layout/Navbar"; // Import your reusable navbar
import "./LandingPage.css";

const cards = [
  {
    name: "Danna",
    age: 28,
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Josh",
    age: 34,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Tina",
    age: 30,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

const LandingPage = () => {
  return (
    <>
      {/* ✅ Use the reusable Navbar */}
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
                {card.name}, {card.age}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LandingPage;
