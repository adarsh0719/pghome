// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency = 'inr', type = 'subscription' } = req.body;

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // stripe expects amount in cents/paisa
      currency,
      metadata: {
        userId: req.user.id,
        type
      }
    });

    // Save the payment record in our database
    const payment = new Payment({
      user: req.user.id,
      type,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });
    await payment.save();

    res.send({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};