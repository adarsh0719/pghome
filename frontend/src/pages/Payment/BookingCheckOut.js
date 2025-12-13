// src/pages/BookingCheckOut.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BookingCheckOut = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const property = state?.property;
  // Broker Details from Navigation State
  const brokerId = state?.brokerId;
  const brokerPrice = state?.brokerPrice;
  const brokerName = state?.brokerName;

  const [type, setType] = useState("single");
  const [months, setMonths] = useState(3);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const fetchExistingBooking = async () => {
      try {
        const { data } = await axios.get("/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        // Find booking for this property
        // Find ACTIVE booking for this property (pending or approved but not paid)
        // We exclude 'paid' and 'rejected' so users can re-book if they want
        const booking = data.find(b =>
          b.property._id === property._id &&
          b.status !== 'cancelled' &&
          b.status !== 'paid' &&
          b.approvalStatus !== 'rejected'
        );
        if (booking) setExistingBooking(booking);
      } catch (err) {
        console.error("Failed to check existing bookings");
      }
    };
    if (user && property) fetchExistingBooking();
  }, [user, property]);

  // Referral State
  const [referralCode, setReferralCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [referralMessage, setReferralMessage] = useState(null);
  const [isCodeValid, setIsCodeValid] = useState(false);

  // Rewards State
  const [useRewards, setUseRewards] = useState(false);
  const userRewards = user?.referralRewards || 0;

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
          {/* ... existing error UI ... */}
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Property Data</h3>
          <p className="text-gray-600 mb-6">We couldn't find the property details. Please try again.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Use Broker Price if available, otherwise Property Rent
  const baseRent = brokerPrice || property.rent;
  const baseTotal = type === "double" ? baseRent * months * 2 : baseRent * months;
  let totalAfterReferral = Math.max(0, baseTotal - discount);

  // Logic for Rewards
  let rewardDiscount = 0;
  if (useRewards && userRewards > 0) {
    rewardDiscount = Math.min(totalAfterReferral, userRewards);
  }
  const finalTotal = Math.max(0, totalAfterReferral - rewardDiscount);

  const monthlyPerPerson = baseRent;

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;
    try {
      const { data } = await axios.post("/api/bookings/validate-referral", { code: referralCode }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDiscount(data.discount);
      setIsCodeValid(true);
      setReferralMessage({ type: 'success', text: `Success! ₹${data.discount} discount applied.` });
      toast.success("Referral code applied!");
    } catch (err) {
      setDiscount(0);
      setIsCodeValid(false);
      setReferralMessage({ type: 'error', text: err.response?.data?.message || "Invalid code" });
    }
  };

  const handlePayment = async () => {
    if (!existingBooking) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/bookings/create-session", { bookingId: existingBooking._id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment init failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (type === "double" && !partnerEmail.trim()) {
      toast.error("Please enter your roommate's email address.");
      return;
    }

    try {
      setLoading(true);
      // Use new request-booking endpoint
      const payload = {
        propertyId: property._id,
        type,
        months,
        partnerEmail: type === "double" ? partnerEmail : null,
        referralCode: isCodeValid ? referralCode : null,
        useRewards: useRewards
      };

      // Add Broker ID if booking via broker
      if (brokerId) {
        payload.brokerId = brokerId;
      }

      const { data } = await axios.post("/api/bookings/request-booking", payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // No Stripe URL yet - Redirect to Dashboard
      toast.success("Booking Request Sent! Wait for owner approval.");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-32 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your selection and proceed to payment</p>
        </div>

        {/* Broker Banner */}
        {brokerId && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                Broker Offer
              </span>
              <span className="text-amber-900 font-medium">
                You are booking via <b>{brokerName}</b>. Special pricing applies.
              </span>
            </div>
            <div className="text-amber-700 font-bold">
              ₹{brokerPrice}/mo
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Property Overview Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Property Image */}
            <div className="h-48 w-full mb-4 rounded-lg overflow-hidden">
              <img
                src={property.images?.[0]?.url || '/default-property.jpg'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-medium px-2 py-1 rounded ${property.availability === 'available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                {property.availability?.toUpperCase() || "AVAILABLE"}
              </span>
              <span className="text-gray-500 text-sm capitalize">{property.type || "Apartment"}</span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h2>
            <p className="text-gray-600 text-sm mb-4">
              {property.location?.address || property.address || "Location unavailable"}
            </p>

            {/* Amenities Preview */}
            <div className="flex flex-wrap gap-2 mb-6">
              {property.amenities?.slice(0, 3).map((amenity, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {amenity}
                </span>
              ))}
              {property.amenities?.length > 3 && (
                <span className="text-gray-500 text-xs self-center">+{property.amenities.length - 3} more</span>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Monthly Rent</span>
                <span className="text-xl font-semibold text-gray-900">₹{baseRent}/month</span>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Booking Details</h3>
              <p className="text-gray-600 text-sm">Customize your booking preferences</p>
            </div>

            {/* Room Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Room Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setType("single")}
                  className={`p-3 border rounded-lg transition-all duration-200 ${type === "single"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">Single Shared</div>
                    <div className="text-xs mt-1 opacity-90">₹{baseRent}/month</div>
                  </div>
                </button>
                <button
                  onClick={() => setType("double")}
                  className={`p-3 border rounded-lg transition-all duration-200 ${type === "double"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">Double Shared</div>
                    <div className="text-xs mt-1 opacity-90">₹{baseRent * 2}/month</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Partner Email */}
            {type === "double" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roommate's Email
                </label>
                <input
                  type="email"
                  placeholder="Enter roommate's email address"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors duration-200 text-sm"
                />
              </div>
            )}

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Duration</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMonths(3)}
                  className={`p-3 border rounded-lg transition-all duration-200 ${months === 3
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">3 Months</div>
                    <div className="text-xs mt-1 opacity-90">Standard</div>
                  </div>
                </button>
                <button
                  onClick={() => setMonths(6)}
                  className={`p-3 border rounded-lg transition-all duration-200 ${months === 6
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">6 Months</div>
                    <div className="text-xs mt-1 opacity-90">Better Value</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase());
                    setIsCodeValid(false);
                    setDiscount(0);
                    setReferralMessage(null);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors duration-200 text-sm uppercase"
                />
                <button
                  onClick={handleApplyReferral}
                  disabled={isCodeValid || !referralCode}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCodeValid ? 'Applied' : 'Apply'}
                </button>
              </div>
              {referralMessage && (
                <p className={`text-xs mt-1 ${referralMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {referralMessage.text}
                </p>
              )}
            </div>

            {/* REWARDS SECTION */}
            {userRewards > 0 && (
              <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-indigo-900">Use Referral Rewards</p>
                    <p className="text-xs text-indigo-700">Balance available: ₹{userRewards}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={useRewards}
                      onChange={() => setUseRewards(!useRewards)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">PRICE BREAKDOWN</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly ({type === "double" ? "per person" : "rent"})</span>
                  <span className="font-medium">₹{monthlyPerPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{months} months</span>
                </div>
                {type === "double" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roommates</span>
                    <span className="font-medium">2 persons</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="font-medium">Referral Discount</span>
                    <span className="font-bold">- ₹{discount}</span>
                  </div>
                )}
                {rewardDiscount > 0 && (
                  <div className="flex justify-between text-indigo-700">
                    <span className="font-medium">Rewards Redeemed</span>
                    <span className="font-bold">- ₹{rewardDiscount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold text-gray-900 border-t border-gray-200 pt-4 mt-4">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* Vacancy Warning */}
              {property.vacancies && (
                <div className="mt-4">
                  {property.vacancies[type] === 0 ? (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-bold">
                      SOLD OUT
                    </div>
                  ) : property.vacancies[type] < 3 ? (
                    <div className="text-orange-600 text-sm font-medium text-center">
                      Hurry! Only {property.vacancies[type]} {type} spots left!
                    </div>
                  ) : null}
                </div>
              )}
            </div>


            {/* TERMS & CONDITIONS */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
              <ul className="space-y-1 mb-4 text-sm text-gray-700 list-disc list-inside">
                <li>I accept responsibility for any activity inside PG/Flat.</li>
                <li>I agree to refund/penalty policies.</li>
                <li>I understand liabilities related to damage, misconduct, or unpaid dues.</li>
              </ul>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 text-[#d16729] border-gray-300 rounded focus:ring-[#d16729] cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  I read and agree to the Terms & Conditions
                </span>
              </label>
            </div>

            {/* ACTION BUTTON */}
            {existingBooking ? (
              existingBooking.status === 'paid' ? (
                <button disabled className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg opacity-80 cursor-not-allowed">
                  Booking Confirmed
                </button>
              ) : existingBooking.approvalStatus === 'approved' ? (
                <button
                  onClick={handlePayment}
                  disabled={loading || !termsAccepted}
                  className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition transform 
                    ${loading || !termsAccepted
                      ? 'bg-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-[#d16729] hover:bg-[#b5571f] hover:scale-[1.02] text-white'}`}
                >
                  {loading ? 'Processing...' : `Pay Now (₹${existingBooking.totalAmount})`}
                </button>
              ) : existingBooking.approvalStatus === 'rejected' ? (
                <button disabled className="w-full bg-red-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg opacity-80 cursor-not-allowed">
                  Request Rejected
                </button>
              ) : (
                <button disabled className="w-full bg-yellow-500 text-white py-4 rounded-xl text-lg font-bold shadow-lg opacity-80 cursor-not-allowed">
                  Request Pending Approval
                </button>
              )
            ) : (
              <button
                onClick={handleBookNow}
                disabled={loading || !termsAccepted || (property.vacancies && property.vacancies[type] === 0)}
                className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg flex justify-center items-center transition transform
                  ${loading || !termsAccepted || (property.vacancies && property.vacancies[type] === 0)
                    ? 'bg-gray-400 cursor-not-allowed opacity-70'
                    : 'bg-[#d16729] hover:bg-[#b5571f] hover:scale-[1.02] text-white'}`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  property.vacancies && property.vacancies[type] === 0
                    ? "SOLD OUT"
                    : `Send Booking Request (Pay ₹${finalTotal})`
                )}
              </button>
            )}

            <p className="text-center text-gray-500 text-sm mt-4">
              Your booking request will be sent to the owner for approval. <br />
              You will be notified when you can proceed with payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckOut;