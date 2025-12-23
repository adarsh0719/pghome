import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Star, ShieldCheck } from 'lucide-react'; // Assuming you have these or similar icons, if not I'll use text or simple SVGs

const BrokerProfileView = ({ userId, userName, userToken }) => {
    const [brokerListing, setBrokerListing] = useState(null);
    const [currentBrokerImageIndex, setCurrentBrokerImageIndex] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);



    const navigate = useNavigate();

    useEffect(() => {
        const fetchBrokerListing = async () => {
            if (!userId) return;
            try {
                const { data } = await axios.get(`/api/users/broker-listing/${userId}`, {
                    headers: userToken ? { Authorization: `Bearer ${userToken}` } : {}
                });
                if (data && data.isActive) {
                    setBrokerListing(data);
                    // Pre-select first package if available
                    if (data.packages && data.packages.length > 0) {
                        // setSelectedPackage(data.packages[0]); // Optional: Auto-select? Better let user choose.
                    }
                }
            } catch (error) {
                console.log("No broker listing found");
            }
        };
        fetchBrokerListing();
    }, [userId, userToken]);

    const handleBookingNavigation = () => {
        if (!userToken) {
            toast.error("Please login to book");
            return;
        }

        // Validation: If packages exist, one must be selected?
        if (brokerListing.packages && brokerListing.packages.length > 0 && !selectedPackage) {
            toast.warning("Please select a package to proceed.");
            return;
        }

        navigate('/booking-checkout', {
            state: {
                property: brokerListing.property,
                brokerId: brokerListing.broker,
                brokerPrice: selectedPackage ? selectedPackage.price : brokerListing.price,
                brokerName: userName,
                selectedPackage: selectedPackage
            }
        });
    };

    if (!brokerListing) return null;

    const currentPrice = selectedPackage ? selectedPackage.price : brokerListing.price;

    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-3xl  border  overflow-hidden mb-10 transition-all duration-300">
            {/* Header Banner */}
            <div className="bg-white/5 px-6 py-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                            Exclusive Offer
                        </span>
                        <span className="text-gray-300 text-sm font-medium">
                            Listed by {userName}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {brokerListing.property?.title || "Premium Property"}
                    </h2>
                    {brokerListing.property?.location && (
                        <div className="flex items-center text-gray-400 text-sm mt-4">
                            <MapPin size={14} className="mr-1" />
                            {brokerListing.property.location.city}, {brokerListing.property.location.state}
                        </div>
                    )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div>
                        <p className="text-sm text-gray-400">Starting from</p>
                        <p className="text-2xl font-bold text-amber-400">₹{brokerListing.price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-amber-400 hover:text-amber-300 font-medium underline decoration-amber-500/50 underline-offset-4 transition"
                    >
                        {isExpanded ? "Hide Details" : "View More Details"}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">

                    {/* Left Col: Images & Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Image Gallery */}
                        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 group shadow-lg">
                            {brokerListing.images && brokerListing.images.length > 0 ? (
                                <>
                                    <img
                                        src={brokerListing.images[currentBrokerImageIndex]}
                                        alt="Property View"
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    {brokerListing.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentBrokerImageIndex((prev) => (prev - 1 + brokerListing.images.length) % brokerListing.images.length);
                                                }}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition border border-white/10"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentBrokerImageIndex((prev) => (prev + 1) % brokerListing.images.length);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition border border-white/10"
                                            >
                                                ›
                                            </button>
                                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                                                {currentBrokerImageIndex + 1} / {brokerListing.images.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    No Images Available
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3">About this Listing</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                {brokerListing.description || "No description provided."}
                            </p>
                        </div>

                        {/* Facilities */}
                        {brokerListing.facilities && brokerListing.facilities.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Facilities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {brokerListing.facilities.map((facility, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium border border-gray-700">
                                            {facility}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Col: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6 sticky top-24">
                            <div className="mb-6">
                                <span className="text-gray-400 text-sm block mb-1">Total Rent</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-amber-400">₹{currentPrice}</span>
                                    <span className="text-gray-400 font-medium">/ month</span>
                                </div>
                                {selectedPackage && (
                                    <p className="text-sm text-amber-500 font-medium mt-1 flex items-center gap-1">
                                        <CheckCircle size={14} /> {selectedPackage.name} Package
                                    </p>
                                )}
                            </div>

                            {/* Packages Selection */}
                            {brokerListing.packages && brokerListing.packages.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">Select Package</h4>
                                    <div className="space-y-3">
                                        {brokerListing.packages.map((pkg, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedPackage(pkg)}
                                                className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 relative overflow-hidden ${selectedPackage === pkg
                                                    ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                                                    : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-bold ${selectedPackage === pkg ? 'text-amber-400' : 'text-gray-200'}`}>
                                                        {pkg.name}
                                                    </span>
                                                    <span className="font-semibold text-gray-200">₹{pkg.price}</span>
                                                </div>
                                                {pkg.amenities && pkg.amenities.length > 0 && (
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {Array.isArray(pkg.amenities) ? pkg.amenities.join(' • ') : pkg.amenities}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Operations */}
                            <button
                                onClick={handleBookingNavigation}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transform transition active:scale-[0.98] mb-4"
                            >
                                Request to Book
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <ShieldCheck size={14} className="text-green-500" />
                                <span>Secure booking via PGHome</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default BrokerProfileView;
