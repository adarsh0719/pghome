import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const { data } = await axios.get(`/api/bookings/verify-payment?session_id=${sessionId}`);
      setBooking(data.booking);
    };
    if (sessionId) verifyPayment();
  }, [sessionId]);

  return (
    <div className="p-6 text-center">
      {booking ? (
        <>
          <h1 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h1>
          <p className="mt-3 text-lg">Property: {booking.property.title}</p>
          <p>Type: {booking.type}</p>
          <p>Total Amount: ₹{booking.totalAmount}</p>
          <p className="text-blue-600 font-semibold mt-4">
            Your Coupon: {booking.coupon}
          </p>
        </>
      ) : (
        <p>Verifying your payment...</p>
      )}
    </div>
  );
};

export default PaymentSuccess;
