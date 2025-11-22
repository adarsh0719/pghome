import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ReceivedRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/connections/received', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRequests(data);
    } catch {
      toast.error('Unable to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id, action, userName) => {
    try {
      const { data } = await axios.post(
        '/api/connections/respond',
        { requestId: id, action },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (action === 'accept') {
        toast.success(`You are now connected with ${userName}`);
      } else {
        toast.info(`Declined connection with ${userName}`);
      }
      
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error('Failed to process request');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          </div>
          <p className="text-gray-500 font-medium">No new requests</p>
          <p className="text-sm text-gray-400">Connection requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {req.sender.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{req.sender.name}</h3>
                  <p className="text-sm text-gray-500">Wants to connect with you</p>
                  <p className="text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleResponse(req._id, 'accept', req.sender.name)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(req._id, 'reject', req.sender.name)}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Decline
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