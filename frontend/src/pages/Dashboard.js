import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import BrokerListingSection from "../components/property/BrokerListingSection";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!user?._id) return;
      try {
        const { data } = await axios.get(`/api/bookings/my-coupon/${user._id}`);
        if (data?.coupon) setCoupon(data.coupon);
      } catch (error) {
        console.error("Error fetching coupon:", error);
      }
    };
    fetchCoupon();
  }, [user]);
  const handleLogout = async () => {
    await logout();
  };



  return (
    <div className="min-h-screen bg-[#f0f0ee] py-10 pt-32">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Left side - Avatar and User Info */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600 capitalize">{user?.userType}</p>
              <p className="text-gray-600">{user?.email}</p>

              {user?.isBlueTick && (
                <span className="inline-flex items-center px-3 py-1 mt-2 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified User
                </span>
              )}
            </div>
          </div>

          {/* Right side - Owner Panel button */}
          {user?.userType === "owner" && (
            <button
              onClick={() => navigate("/owner-bookings")}
              className="bg-[#d16729] hover:bg-[#b5571f] text-white font-semibold px-8 py-3 rounded-lg transition duration-200"
            >
              Owner Panel
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/properties"
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Find Properties</h3>
              <p className="text-sm text-gray-500">Browse available PGs</p>
            </div>
          </Link>

          {user?.userType === 'owner' && (
            <Link
              to="/add-property"
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Property</h3>
                <p className="text-sm text-gray-500">List your PG/room</p>
              </div>
            </Link>
          )}

          <Link
            to="/roommateMatches"
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Roommate Finder</h3>
              <p className="text-sm text-gray-500">Find compatible roommates</p>

            </div>

          </Link>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">My Coupon</h3>

            {coupon ? (
              <div className="relative inline-block mt-2 px-5 py-3 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-white font-mono tracking-widest text-lg rounded-md shadow-inner border border-gray-600 select-all">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 rounded-md"></div>
                <span className="relative z-10">
                  {coupon.toUpperCase()}
                </span>
              </div>
            ) : (
              <p className="text-gray-500">No coupon found yet.</p>
            )}
          </div>
        </div>

        {/* KYC Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">KYC Verification Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Your KYC status:
                <span className={`ml-2 font-semibold capitalize ${user?.kycStatus === 'verified' ? 'text-green-600' :
                  user?.kycStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                  {user?.kycStatus || 'pending'}
                </span>
              </p>
              {user?.kycStatus === 'pending' && (
                <p className="text-sm text-gray-500 mt-1">Your KYC verification is under review</p>
              )}
            </div>
            {['verified', 'approved'].includes(user?.kycStatus?.toLowerCase()) ? (
              <button disabled className="bg-black text-white px-5 py-2 rounded-xl cursor-not-allowed">KYC Completed</button>
            ) : (
              <Link to="/kyc-verify">
                <button className="bg-black text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition">Complete KYC</button>
              </Link>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Subscription Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Status: <span className={`font-semibold ${user?.subscription?.active ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {user?.subscription?.active ? 'Active' : 'Inactive'}
                </span>
              </p>
              {user?.subscription?.active && (
                <p className="text-sm text-gray-500 mt-1">
                  Expires on: {new Date(user.subscription.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <Link to="/subscription">
              <button className="bg-[#d16729] text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition">Manage Subscription</button>
            </Link>
          </div>
        </div>






        {/* BROKER LISTING SECTION */}
        <BrokerListingSection user={user} />

        {/* --- MY BOOKINGS SECTION (For All Users) --- */}
        <MyBookingsSection user={user} />


        {/* REFERRAL SECTION (Always Visible - Conditional State) */}
        {user && (
          <div className="bg-[#1a1a1a] rounded-2xl shadow-xl overflow-hidden mb-8 relative border border-gray-800">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl -ml-8 -mb-8"></div>

            <div className="relative z-10 p-7 flex flex-col md:flex-row items-center justify-between gap-6">

              {/* Text Content */}
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="bg-amber-500/20 text-amber-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/20">
                    Exclusive
                  </span>
                  <span className="text-gray-400 text-[11px] uppercase tracking-wide font-semibold">
                    For You
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  {user.referralCode ? (
                    <>
                      Share the Vibe,{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        Earn Rewards
                      </span>
                    </>
                  ) : (
                    <>
                      Unlock Your{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        Referral Code
                      </span>
                    </>
                  )}
                </h3>

                <p className="text-gray-400 text-[15px] leading-relaxed max-w-lg">
                  {user.referralCode
                    ? "Invite friends. They save ₹500, you earn credits."
                    : "Complete your KYC verification to start earning rewards. Friends save ₹500, you earn credits."}
                </p>
              </div>

              {/* Action Card */}
              <div className="flex flex-col items-center">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                  {user.referralCode ? (
                    // SHOW CODE
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode);
                        toast.success("Referral code copied!", {
                          position: "bottom-center",
                          theme: "dark",
                        });
                      }}
                      className="relative bg-[#252525] ring-1 ring-white/10 rounded-xl px-6 py-4 flex items-center gap-4 hover:bg-[#2a2a2a] transition-all transform hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <div className="text-left">
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                          Your Code
                        </p>
                        <span className="text-3xl font-mono font-bold text-white tracking-widest">
                          {user.referralCode}
                        </span>
                      </div>
                      <div className="h-10 w-[1px] bg-gray-700 mx-2"></div>
                      <svg className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  ) : (
                    // COMPLETE KYC BUTTON
                    <button
                      onClick={() => navigate("/kyc-verify")}
                      className="relative bg-[#252525] ring-1 ring-white/10 rounded-xl px-8 py-4 flex items-center gap-3 hover:bg-[#2a2a2a] transition-all transform hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <div className="text-left">
                        <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                          Action Required
                        </p>
                        <span className="text-lg font-bold text-white tracking-wide">
                          Complete KYC
                        </span>
                      </div>
                      <svg className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

const MyBookingsSection = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get("/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings");
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handlePayment = async (bookingId) => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/bookings/create-session", { bookingId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment init failed");
    } finally {
      setLoading(false);
    }
  };

  if (bookings.length === 0) return null;


  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-8 border border-gray-100">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">My Bookings & Requests</h3>
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
        {bookings.map(book => (
          <div
            key={book._id}
            className="group border border-gray-100 rounded-xl p-3 bg-white hover:border-[#d16729]/30 transition-all duration-200 relative overflow-hidden flex flex-col justify-between w-[85vw] md:w-[calc(50%-8px)] flex-shrink-0"
          >
            <div className="pl-2.5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[150px] sm:max-w-xs" title={book.property?.title}>
                    {book.property?.title || 'Unknown Property'}
                  </h4>
                  <p className="text-[10px] items-center font-medium text-gray-400 uppercase tracking-wide flex mt-0.5">
                    {new Date(book.createdAt).toLocaleDateString()} • {book.months} Months
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border 
                  ${book.status === 'paid' ? 'bg-black text-white rounded border-green-100' :
                    book.approvalStatus === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      book.approvalStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                  {book.status === 'paid' ? 'Booked' : book.approvalStatus === 'pending' ? 'Reviewing' : book.approvalStatus}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-gray-800">₹{book.totalAmount.toLocaleString()}</span>
                {book.referralCodeApplied && (
                  <span className="text-gray-500 text-[10px]">
                    Ref Code: <span className="font-medium text-gray-800">{book.referralCodeApplied}</span>
                  </span>
                )}
              </div>

              <div className="mt-2">
                {book.status === 'paid' ? (
                  <div className="rounded-lg p-2">
                    <div className="flex flex-col space-y-2">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Coupon Code</span>
                      {book.coupon ? (
                        <div className="relative inline-block px-4 py-2 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-white font-mono tracking-widest text-sm rounded-md shadow-inner border border-gray-600 select-all text-center">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 rounded-md"></div>
                          <span className="relative z-10">
                            {book.coupon}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Generating...</p>
                      )}
                    </div>
                  </div>
                ) : book.approvalStatus === 'approved' ? (
                  <button
                    onClick={() => handlePayment(book._id)}
                    disabled={loading}
                    className="w-full h-8 flex items-center  mt-10 justify-center space-x-1.5 bg-[#d16729] hover:bg-[#b5571f] text-white text-xs rounded-lg font-bold shadow-sm transition-all"
                  >
                    <span>Pay Now</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                ) : book.approvalStatus === 'rejected' ? (
                  <div className="text-center text-xs text-red-600 mt-10 font-bold bg-red-50 py-1.5 rounded-lg border border-red-100">
                    Rejected
                  </div>
                ) : (
                  <div className="text-center text-xs mt-10 text-amber-600 bg-amber-50 py-1.5 font-bold rounded-lg border border-amber-100 italic">
                    Waiting approval...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
