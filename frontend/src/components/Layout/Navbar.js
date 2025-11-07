import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <span>PG </span>
          <span>to Home</span>
        </Link>

        {/* Hamburger for mobile */}
        <div
          className="hamburger md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
        </div>

        {/* Desktop navbar */}
        <div className="navbar-center glass-navbar hidden md:flex">
          <Link to="/properties" className="nav-link">
            Properties
          </Link>
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/videotour-guide" className="nav-link">
            Video Tour
          </Link>
          <Link to="/roommateMatches" className="nav-link">
            Roommate Finder
          </Link>
        </div>

        <div className="navbar-right hidden md:flex">
          {user ? (
            <>
              <span className="welcome-text">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="logout-btn ml-3 px-4 py-2 bg-[#d16729] text-white rounded-md transition"
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu md:hidden">
          <Link
            to="/properties"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            Properties
          </Link>
          <Link
            to="/dashboard"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/videotour-guide"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            Video Tour
          </Link>
          <Link
            to="/roommateMatches"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            Roommate Finder
          </Link>

          <div className="mobile-buttons">
            {user ? (
              <>
                <span className="welcome-text text-center">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="logout-btn bg-[#d16729] text-white rounded-md w-full mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="login-btn w-full text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="signup-btn w-full text-center mt-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

     
    </>
  );
};

export default Navbar;
