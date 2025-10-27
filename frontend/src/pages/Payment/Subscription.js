import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const SubscriptionForm = ({ plan }) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // JWT
      const amount = plan.toLowerCase() === 'premium' ? 29900 : 9900; // in paise

      console.log('Submitting subscription:', { email: user.email, amount });

      const { data } = await axios.post(
        '/api/payments/create-subscription',
        { email: user.email, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Response from backend:', data);

      const { clientSecret } = data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        console.error('Stripe payment error:', result.error.message);
        alert(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await axios.post(
    '/api/users/update-subscription',
    { plan: plan.toLowerCase(), email: user.email },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  alert('Payment successful! Subscription activated.');
  window.location.reload();
      }
    } catch (err) {
      console.error('❌ Axios error:', err.response?.data || err.message);
      alert('Payment failed');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-2 border rounded-md" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full"
      >
        {loading ? 'Processing...' : `Subscribe to ${plan}`}
      </button>
    </form>
  );
};

const Subscription = () => {
  const { user } = useAuth();
  const plans = [
    { name: 'Basic', price: 99 },
    { name: 'Premium', price: 299, popular: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
              {plan.popular && <div className="bg-indigo-600 text-white text-center py-2">MOST POPULAR</div>}
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-4xl font-bold mb-4">₹{plan.price}</p>
              {user?.subscription?.active && user.subscription.plan === plan.name.toLowerCase() ? (
                <p className="text-green-600 font-semibold text-center">Your Current Plan</p>
              ) : (
                <Elements stripe={stripePromise}>
                  <SubscriptionForm plan={plan.name} />
                </Elements>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
