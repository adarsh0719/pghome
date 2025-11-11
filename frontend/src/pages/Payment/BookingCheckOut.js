// src/pages/BookingCheckOut.jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BookingCheckOut = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const property = state?.property;

  const [type, setType] = useState("single");
  const [months, setMonths] = useState(3);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
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

  const total = type === "double" ? property.rent * months * 2 : property.rent * months;
  const monthlyPerPerson = type === "double" ? property.rent : property.rent;

  const handleBookNow = async () => {
    if (type === "double" && !partnerEmail.trim()) {
      toast.error("Please enter your roommate's email address.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/bookings/create-session", {
        propertyId: property._id,
        type,
        months,
        partnerEmail: type === "double" ? partnerEmail : null,
      });
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to start booking process");
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Property Overview Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded">
                Available
              </span>
              <span className="text-gray-500 text-sm">{property.type || "Apartment"}</span>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h2>
            <p className="text-gray-600 text-sm mb-4">{property.address || "Premium location"}</p>
            
            <div className="flex space-x-4 mb-6">
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {property.bedrooms || 1} Beds
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {property.bathrooms || 1} Baths
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Monthly Rent</span>
                <span className="text-xl font-semibold text-gray-900">₹{property.rent}/month</span>
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
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    type === "single" 
                      ? "border-gray-900 bg-gray-900 text-white" 
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">Single Shared</div>
                    <div className="text-xs mt-1 opacity-90">₹{property.rent}/month</div>
                  </div>
                </button>
                <button
                  onClick={() => setType("double")}
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    type === "double" 
                      ? "border-gray-900 bg-gray-900 text-white" 
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">Double Shared</div>
                    <div className="text-xs mt-1 opacity-90">₹{property.rent * 2}/month</div>
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
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    months === 3 
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
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    months === 6 
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
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleBookNow}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </div>
              ) : (
                `Proceed to Pay ₹${total}`
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Secure payment processing. Your booking is protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckOut;