import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import ProfilePopup from "./ProfilePopup";
import "./Navbar.css";
import { IoNotificationsOutline } from "react-icons/io5"; 
const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImage, setProfileImage] = useState("/placeholder.jpg");

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) {
        setProfileImage("/placeholder.jpg");
        return;
      }
      try {
        const { data } = await axios.get("/api/roommate/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (data.images?.[0]) setProfileImage(data.images[0]);
        else setProfileImage("/placeholder.jpg");
      } catch (err) {
        console.error("Profile image fetch failed:", err);
        setProfileImage("/placeholder.jpg");
      }
    };
    fetchProfileImage();
  }, [user]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setShowProfile(false);
    setProfileImage("/placeholder.jpg");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar bg-white/60 backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50 px-6 py-3 flex justify-between items-center ">
        {/* Logo */}
        <Link to="/" className="navbar-logo text-2xl font-bold text-blue-700">
          PG <span className="text-orange-600">to Home</span>
        </Link>

        {/* Hamburger (mobile only) */}
        <div
          className="hamburger md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
        </div>

        {/* Desktop Middle Links */}
        <div className="hidden md:flex items-center space-x-6 bg-black/100 px-6 py-2 rounded-full shadow-md">
          <Link to="/properties" className="nav-link text-white hover:text-[#d16729]">
            Properties
          </Link>
          <Link to="/dashboard" className="nav-link text-white hover:text-[#d16729]">
            Dashboard
          </Link>
          <Link to="/videotour-guide" className="nav-link text-white hover:text-[#d16729]">
            Video Tour
          </Link>
          <Link to="/roommateMatches" className="nav-link text-white hover:text-[#d16729]">
            Roommate Finder
          </Link>
        </div>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
            <Link to="/notifications" className="text-xl">
                 <IoNotificationsOutline />
              </Link>
              <span className="text-gray-700">
                Hi, {user.name.split(" ")[0]}
              </span>
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 cursor-pointer hover:scale-105 transition"
                onClick={() => setShowProfile(!showProfile)}
              />
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md hover:from-orange-600 hover:to-orange-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Profile Popup (works for desktop) */}
      {showProfile && user && <ProfilePopup onClose={() => setShowProfile(false)} />}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu md:hidden bg-white/90 backdrop-blur-md shadow-lg">
          <Link to="/properties" className="mobile-link" onClick={() => setMenuOpen(false)}>
            Properties
          </Link>
          <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link to="/videotour-guide" className="mobile-link" onClick={() => setMenuOpen(false)}>
            Video Tour
          </Link>
          <Link to="/roommateMatches" className="mobile-link" onClick={() => setMenuOpen(false)}>
            Roommate Finder
          </Link>
           <Link
  to="/notifications"
  className="mobile-link flex justify-center items-center text-2xl py-3"
  onClick={() => setMenuOpen(false)}
>
  <IoNotificationsOutline />
</Link>


          {user ? (
            <div className="flex flex-col items-center mt-4">
              <img
                src={profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-blue-500 mb-2 cursor-pointer"
                onClick={() => {
                  setShowProfile(true);
                  setMenuOpen(false);
                }}
              />
              <span className="font-medium text-gray-800">{user.name}</span>
              <button
                onClick={handleLogout}
                className="logout-btn mt-3 px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-4">
              <Link to="/login" className="login-btn-mobile" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="signup-btn-mobile" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
