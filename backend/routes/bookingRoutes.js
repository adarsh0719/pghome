const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const User = require('../models/User'); 
//  Create Checkout Session
router.post('/create-session', protect, async (req, res) => {
  try {
    const { propertyId, type, months, partnerEmail } = req.body;

    const property = await Property.findById(propertyId).populate('owner');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const basePrice = property.rent * months;
    const totalAmount = type === 'double' ? basePrice * 2 : basePrice;

    // Prepare booking users
    const bookedBy = [req.user._id];
    if (type === 'double' && partnerEmail) {
      const partner = await User.findOne({ email: partnerEmail });
      if (!partner) {
        return res.status(400).json({ message: 'Partner email not found' });
      }
      bookedBy.push(partner._id);
    }

    // Create pending booking
    const booking = await Booking.create({
      property: property._id,
      owner: property.owner._id,
      bookedBy,
      type,
      months,
      totalAmount,
      status: 'pending',
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: `${property.title} (${type} for ${months} months)` },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/property/${property._id}`,
      metadata: { bookingId: booking._id.toString(), userId: req.user._id.toString() },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Checkout session creation failed' });
  }
});


//  Verify Payment and Generate Coupon
router.get('/verify-payment', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const booking = await Booking.findOne({ stripeSessionId: session.id }).populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (session.payment_status === 'paid' && booking.status !== 'paid') {
      const coupon = `COUPON-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      booking.status = 'paid';
      booking.coupon = coupon;
      await booking.save();
    }

    res.json({
      message: 'Payment verified successfully',
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

router.get('/owner/:ownerId', async (req, res) => {
  const bookings = await Booking.find({ owner: req.params.ownerId })
    .populate('property')
    .populate('bookedBy', 'name email');
  res.json(bookings);
});

router.get('/my-coupon/:userId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookedBy: req.params.userId, status: 'paid' })
      .sort({ createdAt: -1 })
      .select('coupon');

    if (!booking || !booking.coupon) return res.json({ message: 'No coupon found' });
    res.json({ coupon: booking.coupon });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ message: 'Failed to fetch coupon' });
  }
});


module.exports = router;
