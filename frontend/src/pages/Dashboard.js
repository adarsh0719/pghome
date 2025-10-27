import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex items-center space-x-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600 capitalize">{user?.userType}</p>
            <p className="text-gray-600">{user?.email}</p>
            {user?.isBlueTick && (
              <span className="inline-flex items-center px-3 py-1 mt-2 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified User
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/properties"
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Find Properties</h3>
              <p className="text-sm text-gray-500">Browse available PGs</p>
            </div>
          </Link>

          {user?.userType === 'owner' && (
            <Link
              to="/add-property"
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Property</h3>
                <p className="text-sm text-gray-500">List your PG/room</p>
              </div>
            </Link>
          )}

          <Link
            to="/roommateMatches"
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Roommate Finder</h3>
              <p className="text-sm text-gray-500">Find compatible roommates</p>
            </div>
          </Link>
        </div>

        {/* KYC Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">KYC Verification Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Your KYC status:
                <span className={`ml-2 font-semibold capitalize ${
                  user?.kycStatus === 'verified' ? 'text-green-600' : 
                  user?.kycStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {user?.kycStatus || 'pending'}
                </span>
              </p>
              {user?.kycStatus === 'pending' && (
                <p className="text-sm text-gray-500 mt-1">Your KYC verification is under review</p>
              )}
            </div>
            {['verified', 'approved'].includes(user?.kycStatus) ? (
              <button disabled className="bg-green-600 text-white px-5 py-2 rounded-xl cursor-not-allowed">KYC Completed</button>
            ) : (
              <Link to="/kyc-verify">
                <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition">Complete KYC</button>
              </Link>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Subscription Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Status: <span className={`font-semibold ${
                  user?.subscription?.active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user?.subscription?.active ? 'Active' : 'Inactive'}
                </span>
              </p>
              {user?.subscription?.active && (
                <p className="text-sm text-gray-500 mt-1">
                  Expires on: {new Date(user.subscription.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <Link to="/subscription">
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition">Manage Subscription</button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
