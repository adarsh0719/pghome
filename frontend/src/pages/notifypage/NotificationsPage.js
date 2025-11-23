import React, { useState } from "react";
import ReceivedRequests from "../Roommate/ReceivedRequests";
import SentRequests from "../../components/notifications/SentRequests";

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("received");

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 lg:px-8 pt-28 sm:pt-32">
      <div className="max-w-2xl mx-auto w-full">

        {/* Page Title */}
        <div className="mb-6 sm:mb-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your connection activity
          </p>
        </div>

        {/* Notification Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-200 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-200 text-sm sm:text-base">
            <button
              onClick={() => setActiveTab("received")}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center font-medium transition-all
                ${
                  activeTab === "received"
                    ? "border-b-2 border-[#d16729] text-[#d16729] bg-blue-50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              Received
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center font-medium transition-all
                ${
                  activeTab === "sent"
                    ? "border-b-2 border-[#d16729] text-[#d16729] bg-blue-50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              Sent
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">

            {/* RECEIVED TAB */}
            {activeTab === "received" && (
              <>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  New Connection Requests
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <ReceivedRequests />
                </div>
              </>
            )}

            {/* SENT TAB */}
            {activeTab === "sent" && (
              <>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Your Sent Requests
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <SentRequests />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center mt-10 sm:mt-12 text-gray-500 px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl">🔔</span>
          </div>
          <p className="font-medium text-gray-700 text-sm sm:text-base">
            All caught up!
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            You're up to date with your notifications.
          </p>
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
