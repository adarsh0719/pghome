import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const BrokerProfileView = ({ userId, userName, userToken }) => {
    const [brokerListing, setBrokerListing] = useState(null);
    const [brokerDetailsModalOpen, setBrokerDetailsModalOpen] = useState(false);
    const [currentBrokerImageIndex, setCurrentBrokerImageIndex] = useState(0);

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
                }
            } catch (error) {
                // Silent fail if no listing
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

        navigate('/booking-checkout', {
            state: {
                property: brokerListing.property,
                brokerId: brokerListing.broker,
                brokerPrice: brokerListing.price,
                brokerName: userName
            }
        });
    };

    if (!brokerListing) return null;

    return (
        <>
            {/* Broker Offer Card */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-6 rounded-2xl shadow-xl mb-8 relative overflow-hidden border border-gray-700">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="inline-block bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">
                            Broker Offer
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                            Stay at {brokerListing.property?.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4 max-w-lg">
                            {brokerListing.description || "I have a room available at this property. Book directly with me!"}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {brokerListing.facilities && brokerListing.facilities.slice(0, 3).map((f, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 border border-gray-600">
                                    {f}
                                </span>
                            ))}
                            {brokerListing.facilities?.length > 3 && (
                                <span className="text-xs text-gray-400 self-center">+{brokerListing.facilities.length - 3} more</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-amber-400 mb-1">
                            ₹{brokerListing.price}
                            <span className="text-sm text-gray-400 font-normal">/month</span>
                        </div>
                        <button
                            onClick={handleBookingNavigation}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-105 mb-2"
                        >
                            Book via {userName}
                        </button>
                        <button
                            onClick={() => setBrokerDetailsModalOpen(true)}
                            className="text-gray-400 hover:text-white text-sm underline decoration-gray-500 underline-offset-4"
                        >
                            View More Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Broker Details Modal */}
            <AnimatePresence>
                {brokerDetailsModalOpen && brokerListing && (
                    <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <button
                                onClick={() => setBrokerDetailsModalOpen(false)}
                                className="absolute top-4 right-4 z-10 bg-black/10 hover:bg-black/20 p-2 rounded-full transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="h-64 md:h-full bg-gray-100 relative">
                                    {brokerListing.images && brokerListing.images.length > 0 ? (
                                        <div className="relative h-full w-full group">
                                            <img
                                                src={brokerListing.images[currentBrokerImageIndex]}
                                                className="w-full h-full object-cover"
                                                alt="Listing"
                                            />

                                            {/* Navigation Buttons */}
                                            {brokerListing.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentBrokerImageIndex((prev) => (prev - 1 + brokerListing.images.length) % brokerListing.images.length);
                                                        }}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-200"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentBrokerImageIndex((prev) => (prev + 1) % brokerListing.images.length);
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-200"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </button>

                                                    {/* Counter */}
                                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                                        {currentBrokerImageIndex + 1} / {brokerListing.images.length}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">No Images</div>
                                    )}
                                </div>

                                <div className="p-8">
                                    <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded mb-3 uppercase tracking-wide">
                                        Broker Listing
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Available Room</h2>
                                    <p className="text-gray-500 mb-6 text-sm">at {brokerListing.property?.title}</p>

                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {brokerListing.description}
                                        </p>
                                    </div>

                                    <div className="mb-8">
                                        <h4 className="font-bold text-gray-900 mb-2">Facilities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {brokerListing.facilities?.map((f, i) => (
                                                <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-6">
                                        <div>
                                            <p className="text-gray-500 text-sm">Price</p>
                                            <p className="text-3xl font-bold text-amber-600">₹{brokerListing.price}<span className="text-sm text-gray-400">/mo</span></p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setBrokerDetailsModalOpen(false);
                                                handleBookingNavigation();
                                            }}
                                            className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-xl"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BrokerProfileView;
