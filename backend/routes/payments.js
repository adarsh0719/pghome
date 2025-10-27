const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// --------------------
// Create payment intent for subscription
// --------------------
router.post('/create-subscription', protect, async (req, res) => {
  try {
    const { email, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in smallest currency unit (paise)
      currency: 'inr',
      metadata: {
        email,
        plan: amount === 29900 ? 'premium' : 'basic',
        type: 'subscription',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, amount: amount / 100 });
  } catch (err) {
    console.error('Stripe subscription error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// --------------------
// Create payment intent for booking
// --------------------
router.post('/create-booking-payment', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: 'Booking ID is required' });

    const booking = await Booking.findById(bookingId).populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalAmount * 100, // in paise
      currency: 'inr',
      metadata: {
        bookingId: booking._id.toString(),
        type: 'booking',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret }); // <-- frontend uses this
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    res.status(500).json({ message: 'Stripe payment creation failed' });
  }
});

// --------------------
// Stripe webhook to handle payments
// --------------------
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log("Webhook received, headers:", req.headers); 
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log(' Webhook received:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Booking payment
      if (paymentIntent.metadata.type === 'booking') {
        const bookingId = paymentIntent.metadata.bookingId;
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.transactionId = paymentIntent.id;
          booking.status = 'confirmed';

          await Property.findByIdAndUpdate(booking.property, { availability: 'occupied' });
          await booking.save();
          console.log(' Booking payment updated for bookingId:', bookingId);
        }
      }

      // Subscription payment
      if (paymentIntent.metadata.type === 'subscription') {
        const email = paymentIntent.metadata.email;
        const user = await User.findOne({ email });
        if (user) {
          user.subscription.active = true;
          user.subscription.plan = paymentIntent.metadata.plan;
          user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          user.isBlueTick = true;

          await user.save();
          console.log(' Subscription updated in DB for:', email);
        }
      }
    } else {
      console.log(' Event type not handled:', event.type);
    }

    res.json({ received: true });
  }
);

module.exports = router;
