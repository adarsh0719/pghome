import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const SentRequests = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSentRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/connections/sent', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSentRequests(data);
    } catch (error) {
      toast.error('Unable to load sent requests');
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId, receiverName) => {
    try {
      await axios.post(
        '/api/connections/cancel',
        { requestId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      toast.success(`Connection request to ${receiverName} has been withdrawn`);
      setSentRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRequestAccepted = (data) => {
      toast.success(
        <div className="p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Connection Established!</p>
              <p className="text-sm text-gray-600 mt-1">Your connection request was accepted</p>
              <button 
                onClick={() => window.location.href = `/chat/${data.chatId}`}
                className="mt-3 text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start Chatting
              </button>
            </div>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 8000,
          closeButton: true,
        }
      );
      
      fetchSentRequests();
    };

    socket.on('connection_request_accepted', handleRequestAccepted);

    return () => {
      socket.off('connection_request_accepted', handleRequestAccepted);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {sentRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          </div>
          <p className="text-gray-500 font-medium">No pending requests</p>
          <p className="text-sm text-gray-400">Your sent connection requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sentRequests.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {req.receiver.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{req.receiver.name}</h3>
                  <p className="text-sm text-gray-500">Connection request sent</p>
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
              
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5 animate-pulse"></span>
                  Pending
                </span>
                <button
                  onClick={() => cancelRequest(req._id, req.receiver.name)}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel Request
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