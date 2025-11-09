import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const OwnerBookings = () => {
  const { user, loading } = useAuth(); // get loading too
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?._id) return; // 🛑 wait until user exists

      try {
        const { data } = await axios.get(`/api/bookings/owner/${user._id}`);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching owner bookings:", error);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Please login to see your bookings.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Property Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((b) => (
          <div key={b._id} className="border p-4 mb-3 rounded-lg shadow">
            <p>🏠 {b.property.title}</p>
            <p>👥 Type: {b.type}</p>
            <p>💰 ₹{b.totalAmount}</p>
            <p>🎫 Coupon: {b.coupon || "Pending"}</p>
            <p>📅 Status: {b.status}</p>
            <p>
              👤 Booked By:{" "}
              {b.bookedBy.map((u) => (
                <span key={u._id}>{u.name} </span>
              ))}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default OwnerBookings;
