import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#d16729] rounded-full animate-spin"></div>
                {/* Inner Ring (optional for better aesthetics) */}
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-gray-100 border-b-gray-400 rounded-full animate-spin-slow opacity-50"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
