import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Confetti from "react-confetti";
import SuccessVideo from "../../images/d2ae7d17-a138-4680-aea0-349471c00d22.mp4";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const { data } = await axios.get(
          `/api/bookings/verify-payment?session_id=${sessionId}`
        );
        setBooking(data.booking);
        setIsLoading(false);
        setShowConfetti(true);
      } catch (error) {
        console.error(" Payment verification failed:", error);
        setIsLoading(false);
      }
    };

    if (sessionId) verifyPayment();
  }, [sessionId]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-gray-50 p-6 pt-16 font-['Poppins']">
      {/* Loader */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center h-60">
          <div className="loader border-t-4 border-green-500 rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">
            Verifying your payment...
          </p>
        </div>
      )}

      {/* Confetti */}
      {!isLoading && showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}

      {/* Success Card */}
      {!isLoading && booking && (
        <>
          {/* Animation Video */}
          <div className="w-full sm:w-[400px] rounded-2xl overflow-hidden shadow-md mb-6 bg-white">
            <video
              className="w-full h-[180px] object-cover"
              autoPlay
              loop
              muted
              onLoadedData={() => setShowConfetti(true)}
            >
              <source src={SuccessVideo} type="video/mp4" />
            </video>

            {/* Booking Info */}
            <div className="p-5 text-center">
              <h3 className="text-base text-gray-800 font-semibold mb-2">
                Booking Details
              </h3>
              <hr className="mb-4 border-gray-300" />
              <div className="text-left space-y-1 text-sm text-gray-700">
                <p>
                  <strong>Property:</strong> {booking.property.title}
                </p>
                <p>
                  <strong>Type:</strong> {booking.type}
                </p>
                <p>
                  <strong>Amount Paid:</strong> ₹{booking.totalAmount}
                </p>
                {booking.coupon && (
  <div className="relative inline-block mt-2 px-5 py-3 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-white font-mono tracking-widest text-lg rounded-md shadow-inner border border-gray-600  select-all">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 rounded-md"></div>
    <span className="relative z-10">
       {booking.coupon.toUpperCase()}
    </span>
  </div>
)}

              </div>

              <Link
                to="/dashboard"
                className="block w-full mt-5 bg-green-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Text Below Card */}
          <h2 className="text-green-600 text-2xl sm:text-3xl font-bold animate-bounce text-center">
            Payment Successful!!
          </h2>
        </>
      )}
    </div>
  );
};

export default PaymentSuccess;
