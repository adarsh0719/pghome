import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const OwnerBookings = () => {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?._id) return;

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
      <div className="p-6 text-center text-gray-600">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Please log in to see your bookings.</p>
      </div>
    );
  }

  return (
    <div className=" mt-10 p-6 sm:p-10 lg:p-16  bg-gray-50 min-h-screen font-['Poppins']">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        My Property Bookings
      </h2>

      {bookings.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
            >
              <h3 className="text-xl font-semibold text-[#d16729] mb-2">
                {b.property?.title || "Property"}
              </h3>

              <div className="space-y-1 text-gray-700">
                <p>
                  <span className="font-medium">Type:</span> {b.type}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ₹{b.totalAmount}
                </p>
                <p>
                  <span className="font-medium">Coupon:</span>{" "}
                  {b.coupon || "—"}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-md text-sm font-medium ${
                      b.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </p>
                <div>
                  <span className="font-medium">Booked By:</span>
                  <div className="mt-1 text-sm text-gray-600">
                    {b.bookedBy.map((u) => (
                      <p key={u._id}>{u.email}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
