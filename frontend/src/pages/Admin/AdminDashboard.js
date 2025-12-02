import React, { useState } from 'react';
import AdminUsers from './AdminUsers';
import AdminProperties from './AdminProperties';
import AdminBookings from './AdminBookings';
import AdminKycList from '../kyc/AdminKycList';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <AdminUsers />;
            case 'properties':
                return <AdminProperties />;
            case 'bookings':
                return <AdminBookings />;
            case 'kyc':
                return <AdminKycList />;
            default:
                return <AdminUsers />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row pt-20 md:pt-32">
            {/* Mobile Header */}
            <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center fixed w-full z-20 top-16">
                <h2 className="text-xl font-bold text-[#d16729]">Admin Panel</h2>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-gray-600 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isSidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:top-0 md:h-full pt-20 md:pt-32
            `}>
                <div className="p-6 hidden md:block">
                    <h2 className="text-2xl font-bold text-[#d16729]">Admin Panel</h2>
                </div>
                <nav className="mt-6">
                    <button
                        onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-6 py-3 hover:bg-[#d16729]/10 transition-colors ${activeTab === 'users' ? 'bg-[#d16729]/10 text-[#d16729] border-r-4 border-[#d16729]' : 'text-gray-600'
                            }`}
                    >
                        Users Management
                    </button>
                    <button
                        onClick={() => { setActiveTab('properties'); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-6 py-3 hover:bg-[#d16729]/10 transition-colors ${activeTab === 'properties' ? 'bg-[#d16729]/10 text-[#d16729] border-r-4 border-[#d16729]' : 'text-gray-600'
                            }`}
                    >
                        Properties
                    </button>
                    <button
                        onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-6 py-3 hover:bg-[#d16729]/10 transition-colors ${activeTab === 'bookings' ? 'bg-[#d16729]/10 text-[#d16729] border-r-4 border-[#d16729]' : 'text-gray-600'
                            }`}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => { setActiveTab('kyc'); setIsSidebarOpen(false); }}
                        className={`w-full text-left px-6 py-3 hover:bg-[#d16729]/10 transition-colors ${activeTab === 'kyc' ? 'bg-[#d16729]/10 text-[#d16729] border-r-4 border-[#d16729]' : 'text-gray-600'
                            }`}
                    >
                        KYC Requests
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 md:ml-64 mt-16 md:mt-0">
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 min-h-[80vh] overflow-x-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
