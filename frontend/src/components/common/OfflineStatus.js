import React, { useState, useEffect } from 'react';

const OfflineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsOnline(navigator.onLine);
    };

    if (isOnline) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm">
            <div className="text-center p-8 max-w-md mx-auto">
                <div className="mb-6 flex justify-center">
                    {/* SVG Illustration for No Internet */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-32 h-32 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M1 1l22 22" />
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                        <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">No Internet Connection</h2>
                <p className="text-gray-600 mb-8">
                    It seems you are offline. Please check your internet connection and try again.
                </p>
                <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-[#d16729] hover:bg-[#b54015] text-white font-bold rounded-xl shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d16729] focus:ring-offset-2"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
};

export default OfflineStatus;
