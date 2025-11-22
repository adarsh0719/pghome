import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const NotificationHandler = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // --- REQUEST ACCEPTED ---
    socket.on('connection_request_accepted', () => {
      toast.success(
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Request Accepted!</p>
            <p className="text-sm text-gray-600">Your connection request was accepted.</p>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 6000,
          progressStyle: { background: '#10B981' },
          style: {
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
          }
        }
      );
    });

    // --- YOU SENT REQUEST → OTHER ACCEPTED ---
    socket.on('your_request_accepted', (data) => {
      toast.success(
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{data.acceptor.name} Accepted Your Request</p>
            <p className="text-sm text-gray-600">Now you are connected.</p>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 8000,
          progressStyle: { background: '#10B981' },
          style: {
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer'
          },
          onClick: () => {
            window.location.href = data.chatId
              ? `/chat/${data.chatId}`
              : '/dashboard?tab=connections';
          }
        }
      );
    });

    // --- NEW REQUEST RECEIVED ---
    socket.on('new_connection_request', (data) => {
      toast.info(
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">👋</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">New Connection Request</p>
            <p className="text-sm text-gray-600">{data.sender.name} wants to connect.</p>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 8000,
          progressStyle: { background: '#3B82F6' },
          style: {
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer'
          },
          onClick: () => window.location.href = '/dashboard?tab=requests'
        }
      );
    });

    // --- REQUEST REJECTED ---
    socket.on('connection_request_rejected', () => {
      toast.warning(
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 text-lg">⚠</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Request Declined</p>
            <p className="text-sm text-gray-600">Your request was not accepted.</p>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          progressStyle: { background: '#F59E0B' },
          style: {
            background: '#fff',
            borderRadius: '12px',
            padding: '16px'
          }
        }
      );
    });

    // --- REQUEST CANCELLED ---
    socket.on('request_cancelled', (data) => {
      toast.info(
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-lg">↶</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Request Withdrawn</p>
            <p className="text-sm text-gray-600">{data.sender.name} cancelled the request.</p>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 6000,
          progressStyle: { background: '#6B7280' },
          style: {
            background: '#fff',
            borderRadius: '12px',
            padding: '16px'
          }
        }
      );
    });

    return () => {
      socket.off('connection_request_accepted');
      socket.off('your_request_accepted');
      socket.off('new_connection_request');
      socket.off('connection_request_rejected');
      socket.off('request_cancelled');
    };
  }, [socket]);

  return null;
};

export default NotificationHandler;
