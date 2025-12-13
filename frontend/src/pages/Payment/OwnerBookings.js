import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
const OwnerBookings = () => {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`/api/bookings/owner/${user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookings(data);
    } catch (error) {
      console.error("Error fetching owner bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchOwnerProperties();
  }, [user]);

  const [properties, setProperties] = useState([]);
  const fetchOwnerProperties = async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`/api/properties/user/${user._id}`);
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties", error);
    }
  };

  // Handle Approve/Reject
  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`Booking ${status}`);
      fetchBookings(); // Refresh list
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      const { data } = await axios.get(`/api/users/full-details/${id}`);
      setSelectedUser(data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch user details", err);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading...</div>;
  if (!user) return <div className="p-6 text-center text-red-600">Please log in.</div>;

  // Filter Bookings
  const pendingRequests = bookings.filter(b => b.approvalStatus === 'pending');
  const pastBookings = bookings.filter(b => b.approvalStatus !== 'pending');

  return (
    <div className="mt-10 p-6 sm:p-10 lg:p-16 bg-gray-50 min-h-screen font-['Poppins']">

      {/* --- PROPERTY VACANCY STATS --- */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
        Property Vacancies
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {properties.map(p => (
          <div key={p._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{p.location?.address}</p>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded mb-2">
              <span className="text-gray-600 font-medium">Single Vacancies</span>
              <span className={`font-bold ${p.vacancies?.single > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {p.vacancies?.single || 0}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="text-gray-600 font-medium">Double Vacancies</span>
              <span className={`font-bold ${p.vacancies?.double > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {p.vacancies?.double || 0}
              </span>
            </div>
          </div>
        ))}
        {properties.length === 0 && <p className="text-gray-500">No properties listed.</p>}
      </div>

      {/* --- PENDING REQUESTS SECTION --- */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
        Pending Requests
      </h2>

      {pendingRequests.length === 0 ? (
        <p className="text-gray-500 mb-12">No pending requests at the moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {pendingRequests.map((b) => (
            <div key={b._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{b.property?.title}</h3>
                  <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-800">{b.bookedBy[0]?.name}</span></p>
                </div>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium border border-blue-100">
                  New Request
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded border border-gray-100">
                <div className="flex justify-between">
                  <span>Type:</span> <span className="font-medium text-gray-900">{b.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span> <span className="font-medium text-gray-900">{b.months} Months</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span>Total Amount:</span> <span className="font-bold text-gray-900">₹{b.totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fetchUserDetails(b.bookedBy[0]?._id)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition"
                >
                  View KYC
                </button>
                <button
                  onClick={() => updateStatus(b._id, 'rejected')}
                  className="flex-1 bg-red-50 border border-red-200 text-red-700 py-2 rounded text-sm font-medium hover:bg-red-100 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus(b._id, 'approved')}
                  className="flex-1 bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-gray-800 transition shadow-sm"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* --- BOOKING HISTORY SECTION --- */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 pt-6 border-t border-gray-200">
        Booking History & Active
      </h2>

      {pastBookings.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          <p>No active or past bookings.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastBookings.map((b) => (
            <div
              key={b._id}
              className={`bg-white border rounded-xl shadow-sm p-6 relative ${b.approvalStatus === 'rejected' ? 'border-red-200 opacity-75' : 'border-gray-200'
                }`}
            >
              <span className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide ${b.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {b.approvalStatus}
              </span>

              <h3 className="text-lg font-semibold text-[#d16729] mb-4">
                {b.property?.title || "Property"}
              </h3>

              <div className="space-y-1 text-gray-600 text-sm">
                <p><span className="font-medium">Type:</span> {b.type}</p>
                <p><span className="font-medium">Amount:</span> ₹{b.totalAmount}</p>
                {b.coupon && (
                  <p><span className="font-medium">Coupon Generated:</span> <span className="font-mono font-bold text-white bg-black px-2 py-0.5 rounded border border-gray-200">{b.coupon}</span></p>
                )}
                <p><span className="font-medium">Payment:</span>
                  <span className={`ml-2 ${b.status === 'paid' ? 'text-green-600 font-bold' : 'text-yellow-600'}`}>
                    {b.status.toUpperCase()}
                  </span>
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="font-medium text-xs uppercase tracking-wider text-gray-400">Booked By</span>
                  {b.bookedBy.map((u) => (
                    <p key={u._id} className="text-gray-800 font-medium">{u.name} <span className="text-gray-400 font-normal">({u.email})</span></p>
                  ))}
                </div>
              </div>

              <button
                onClick={() => fetchUserDetails(b.bookedBy[0]._id)}
                className="mt-4 w-full bg-black border border-gray-300 text-white py-2 rounded-lg  transition text-sm"
              >
                View Booker Details
              </button>
            </div>
          ))}
        </div>
      )}


      {/* --- MODAL (Outside Loop) --- */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 pt-20">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-0 overflow-hidden transform transition-all scale-100">

            <div className="bg-[#d16729] p-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold">User Details</h3>
              <button className="hover:text-gray-200 text-2xl leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedUser.name}</h4>
                  <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                  <p className="text-gray-500 text-sm">{selectedUser.phone}</p>
                </div>
              </div>

              <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">KYC Information</h4>

              {selectedUser.kycId ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Aadhaar (Masked)</p>
                      <p className="font-medium font-mono">{selectedUser.kycId.aadhaarMasked}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedUser.kycId.status === "approved" ? "bg-green-100 text-green-700" :
                        selectedUser.kycId.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        }`}>
                        {selectedUser.kycId.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Documents Submitted</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400">Front</span>
                        <a href={selectedUser.kycId.frontImageUrl} target="_blank" rel="noreferrer">
                          <img src={selectedUser.kycId.frontImageUrl} alt="Front" className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition cursor-zoom-in" />
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400">Back</span>
                        <a href={selectedUser.kycId.backImageUrl} target="_blank" rel="noreferrer">
                          <img src={selectedUser.kycId.backImageUrl} alt="Back" className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition cursor-zoom-in" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-400">KYC Not Submitted or Not Available</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm">
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
