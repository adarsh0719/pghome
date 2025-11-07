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
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error('Failed to respond');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="text-base">
      {requests.length === 0 ? (
        <p className="text-gray-500 text-center text-sm">No new requests</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
            >
              <span className="font-semibold text-gray-800">{req.sender.name}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleResponse(req._id, 'accept')}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-md transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(req._id, 'reject')}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedRequests;
