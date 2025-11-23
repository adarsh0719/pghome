import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SentRequests = () => {
  const { user } = useAuth();
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSentRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/connections/sent', {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSentRequests(data.filter(req => req.status === "pending"));
    } catch {
      toast.error('Unable to load sent requests');
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (id, name) => {
    try {
      await axios.post(
        '/api/connections/cancel',
        { requestId: id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success(`Connection request to ${name} withdrawn`);
      setSentRequests(prev => prev.filter(req => req._id !== id));
    } catch {
      toast.error('Failed to cancel');
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="p-4 bg-white rounded-xl border animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {sentRequests.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">

          {sentRequests.map(req => (
            <div
              key={req._id}
              className="p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-150"
            >
              <div className="flex items-center space-x-4">

                {/* Profile Image */}
                {req.receiver.profileImage ? (
                  <img
                    src={req.receiver.profileImage}
                    alt={req.receiver.name}
                    className="w-14 h-14 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {req.receiver.name[0]}
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-gray-900 font-semibold">
                    {req.receiver.name}
                  </p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    You sent a connection request
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => cancelRequest(req._id, req.receiver.name)}
                  className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-200 hover:bg-red-100 transition"
                >
                  Cancel
                </button>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default SentRequests;
