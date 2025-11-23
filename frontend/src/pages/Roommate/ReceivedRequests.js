import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ReceivedRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/api/connections/received', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRequests(data);
      console.log(data);
    } catch {
      toast.error('Failed to fetch requests');
    }
  };

  const handleResponse = async (id, action) => {
    try {
      const { data } = await axios.post(
        '/api/connections/respond',
        { requestId: id, action },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success(data.message);
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch {
      toast.error('Failed to respond');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No new requests</p>
      ) : (
        requests.map(req => (
          <div
            key={req._id}
            className="p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-150"
          >
            <div className="flex items-center space-x-4">

              {/* Profile Bubble */}
             {/* Profile Image */}
{req.sender.profileImage ? (
  <img
    src={req.sender.profileImage}
    className="w-14 h-14 rounded-full object-cover"
  />
) : (
  <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white text-xl">
    {req.sender.name[0]}
  </div>
)}





              {/* Message */}
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">
                  {req.sender.name}
                </p>
                <p className="text-gray-600 text-sm mt-0.5">
                  wants to connect with you
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleResponse(req._id, "accept")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded-xl"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(req._id, "reject")}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-xl"
                >
                  Reject
                </button>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReceivedRequests;
