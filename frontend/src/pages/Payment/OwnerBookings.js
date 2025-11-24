import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const OwnerBookings = () => {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const fetchUserDetails = async (id) => {
  try {
    const { data } = await axios.get(`/api/users/full-details/${id}`);
    setSelectedUser(data);
    setShowModal(true);
  } catch (err) {
    console.error("Failed to fetch user details", err);
  }
};


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
                <button
  onClick={() => fetchUserDetails(b.bookedBy[0]._id)}
  className="mt-4 w-full bg-[#d16729] text-white py-2 rounded-lg hover:bg-[#b45720] transition"
>
  More Details
</button>
        {showModal && selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-3">
    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">

      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        onClick={() => setShowModal(false)}
      >
        ×
      </button>

      <h3 className="text-2xl font-semibold text-[#d16729] mb-4">
        User Details
      </h3>

      <div className="space-y-2 text-gray-800">
        <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
        <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
        <p><span className="font-medium">Phone:</span> {selectedUser.phone}</p>
        <p><span className="font-medium">User Type:</span> {selectedUser.userType}</p>
      </div>

      <h4 className="mt-5 font-semibold text-gray-700">KYC Details</h4>

      {selectedUser.kycId ? (
        <div className="mt-2 space-y-2">
          <p><span className="font-medium">Aadhaar:</span> {selectedUser.kycId.aadhaarMasked}</p>
          <p>
            <span className="font-medium">KYC Status:</span>{" "}
            <span className={`px-2 py-1 rounded text-sm ${
              selectedUser.kycId.status === "approved"
                ? "bg-green-100 text-green-700"
                : selectedUser.kycId.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}>
              {selectedUser.kycId.status}
            </span>
          </p>

          {selectedUser.kycId.rejectedReason && (
            <p className="text-red-600">
              <span className="font-medium">Reason:</span> {selectedUser.kycId.rejectedReason}
            </p>
          )}

          <div className="mt-3">
            <p className="font-medium">KYC Images:</p>
            <div className="flex gap-3 mt-2">
              <img src={selectedUser.kycId.frontImageUrl} className="w-24 h-16 rounded border" />
              <img src={selectedUser.kycId.backImageUrl} className="w-24 h-16 rounded border" />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mt-2">KYC not submitted.</p>
      )}

    </div>
  </div>
)}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
