import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar container */}
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#FF5A5F] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PG</span>
            </div>
            <span className="text-2xl font-bold text-[#484848] tracking-tight">
              PG-to-Home
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/properties"
              className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
            >
              Properties
            </Link>
            <Link
              to="/dashboard"
              className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
            >
              Dashboard
            </Link>


            <Link
              to="/videotour-guide"
              className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
            >
              Video Tour
            </Link>

            <Link
              to="/roommateMatches"
              className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
            >
              Roommate Finder
            </Link>
          </div>

          {/* Right: Buttons / Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.userType === 'owner' && (
                  <Link
                    to="/add-property"
                    className="bg-[#FF5A5F] text-white px-4 py-2 rounded-lg hover:bg-[#E0484F] transition duration-200"
                  >
                    Add Property
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-[#484848] hover:text-[#FF5A5F] transition duration-200"
                  >
                    <div className="w-9 h-9 bg-[#FF5A5F]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#FF5A5F] font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{user.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#484848]">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.userType}
                        </p>
                        {user.isBlueTick && (
                          <span className="inline-flex items-center px-2 py-1 mt-1 bg-[#FF5A5F]/10 text-[#FF5A5F] text-xs rounded-full">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-[#484848] hover:bg-[#F7F7F7] transition duration-150"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      <Link
                        to="/subscription"
                        className="block px-4 py-2 text-sm text-[#484848] hover:bg-[#F7F7F7] transition duration-150"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Subscription
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-[#FF5A5F] hover:bg-[#F7F7F7] transition duration-150"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#FF5A5F] text-white px-5 py-2 rounded-lg hover:bg-[#E0484F] transition duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#484848] hover:text-[#FF5A5F] transition duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link
                to="/properties"
                className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Properties
              </Link>

              <Link
                to="/videotour-guide"
                className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Video Tour
              </Link>

              <Link
                to="/roommateMatches"
                className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Roommate Finder
              </Link>

              {user ? (
                <>
                  {user.userType === 'owner' && (
                    <Link
                      to="/add-property"
                      className="bg-[#FF5A5F] text-white px-4 py-2 rounded-lg hover:bg-[#E0484F] transition duration-200 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Property
                    </Link>
                  )}

                  <Link
                    to="/dashboard"
                    className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/subscription"
                    className="text-[#484848] hover:text-[#FF5A5F] font-medium transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Subscription
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-[#FF5A5F] font-medium hover:text-[#E0484F] transition duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="text-[#484848] hover:text-[#FF5A5F] font-medium text-center py-2 transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#FF5A5F] text-white px-4 py-2 rounded-lg hover:bg-[#E0484F] transition duration-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Close profile menu on outside click */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
