// BookingPayment.js
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe with your public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// -------------------------
// Checkout Form Component
// -------------------------
const CheckoutForm = ({ bookingId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (e) => {
  e.preventDefault();

  if (!stripe || !elements) return;

  try {
    // Get token from localStorage (adjust if you store it elsewhere)
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to make a payment.');
      return;
    }

    // 1️⃣ Create payment intent on backend
    const API_URL = process.env.REACT_APP_API_URL;
    const res = await fetch(`${API_URL}/api/payments/create-booking-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // <-- send JWT
      },
      body: JSON.stringify({ bookingId })
    });

    if (res.status === 401) {
      alert('Unauthorized. Please login again.');
      return;
    }

    const data = await res.json();

    // 2️⃣ Confirm payment with Stripe
    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.error) {
      console.error(result.error.message);
      alert(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      alert('Payment successful! Booking confirmed.');
      if (onSuccess) onSuccess();
    }

  } catch (err) {
    console.error('Payment failed:', err);
    alert('Payment failed. Please try again.');
  }
};

  return (
    <form onSubmit={handlePayment} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Pay for Booking</h2>
      <div className="mb-4 p-3 border rounded">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
      >
        Pay Now
      </button>
    </form>
  );
};

// -------------------------
// Main Wrapper Component
// -------------------------
const BookingPayment = ({ bookingId, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm bookingId={bookingId} onSuccess={onSuccess} />
    </Elements>
  );
};

export default BookingPayment;
