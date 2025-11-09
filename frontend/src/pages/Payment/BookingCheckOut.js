import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BookingCheckOut = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const property = state?.property; // 🟢 Get property from navigate state

  const [type, setType] = useState("single");
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);

  if (!property) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-semibold">No property data found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const total = type === "double" ? property.rent * months * 2 : property.rent * months;

  const handleBookNow = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/bookings/create-session", {
        propertyId: property._id,
        type,
        months,
      });
      window.location.href = data.url; // redirect to Stripe Checkout
    } catch (error) {
      console.error(error);
      toast.error("Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg max-w-lg mx-auto mt-24 bg-white">
      <h2 className="text-2xl font-semibold mb-2">{property.title}</h2>
      <p className="text-gray-600 mb-4">Rent: ₹{property.rent}/month</p>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Room Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="single">Single Shared</option>
            <option value="double">Double Shared</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Duration</label>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="border rounded p-2 w-full"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
          </select>
        </div>

        <p className="text-lg font-semibold">Total: ₹{total}</p>

        <button
          onClick={handleBookNow}
          disabled={loading}
          className="bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600"
        >
          {loading ? "Processing..." : "Proceed to Pay"}
        </button>
      </div>
    </div>
  );
};

export default BookingCheckOut;
