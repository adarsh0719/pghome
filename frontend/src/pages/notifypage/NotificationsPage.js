import React from 'react';
import ReceivedRequests from '../Roommate/ReceivedRequests';
import SentRequests from '../../components/notifications/SentRequests';

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Manage your connection requests</p>
        </div>

        {/* Notifications Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-4 px-6 text-center border-b-2 border-blue-500 text-blue-600 font-semibold bg-blue-50">
              Connection Requests
            </button>
            <button className="flex-1 py-4 px-6 text-center border-b-2 border-transparent text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50">
              Sent Requests
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Received Requests Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                New Connection Requests
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">3 new</span>
              </h2>
              <div className="space-y-3">
                <ReceivedRequests />
              </div>
            </div>

            {/* Sent Requests Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Sent Requests</h2>
              <div className="space-y-3">
                <SentRequests />
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Illustration */}
        <div className="text-center mt-12 text-gray-500">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <p className="font-medium">All caught up!</p>
          <p className="text-sm">You're up to date with all your notifications</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;