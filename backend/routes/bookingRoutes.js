const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const User = require('../models/User');
// Validate Referral Code
router.post('/validate-referral', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    // Find user with this referral code
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });

    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    // Prevent self-referral
    if (referrer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot use your own referral code' });
    }

    // Optional: Check if referrer is still KYC verified (strict mode)
    // if (referrer.kycStatus !== 'approved') { ... }

    res.json({
      message: 'Referral code applied!',
      discount: 500, // Hardcoded for now
      code: code.toUpperCase()
    });

  } catch (err) {
    console.error('Referral Validation Error:', err);
    res.status(500).json({ message: 'Server error validating code' });
  }
});


//  Create Checkout Session
router.post('/create-session', protect, async (req, res) => {
  try {
    const { propertyId, type, months, partnerEmail, referralCode, useRewards } = req.body;

    const property = await Property.findById(propertyId).populate('owner');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const basePrice = property.rent * months;
    let totalAmount = type === 'double' ? basePrice * 2 : basePrice;

    // --- REFERRAL DISCOUNT (Entering a code) ---
    let discountAmount = 0;
    let validReferralCode = null;

    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer && referrer._id.toString() !== req.user._id.toString()) {
        discountAmount = 500; // Flat discount
        validReferralCode = referralCode.toUpperCase();
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }
    }

    // --- REWARDS REDEMPTION (Using own points) ---
    let rewardsUsed = 0;
    if (useRewards && req.user.referralRewards > 0) {
      // Can redeem up to the remaining total amount
      rewardsUsed = Math.min(totalAmount, req.user.referralRewards);
      totalAmount = Math.max(0, totalAmount - rewardsUsed);
    }

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
      totalAmount, // Final amount to pay
      status: 'pending',
      referralCodeApplied: validReferralCode,
      discountAmount,
      rewardsUsed,
      isReferralRewardClaimed: false
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${property.title} (${type} for ${months} months)`
            },
            unit_amount: Math.round(totalAmount * 100), // Stripe uses paisa
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


//  Verify Payment and Generate Coupon (and Handle Referral Rewards)
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

      // 1. Credit the REFERRER (if a code was used)
      if (booking.referralCodeApplied && !booking.isReferralRewardClaimed) {
        const referrer = await User.findOne({ referralCode: booking.referralCodeApplied });
        if (referrer) {
          referrer.referralRewards = (referrer.referralRewards || 0) + 300;
          await referrer.save();
          booking.isReferralRewardClaimed = true;
          console.log(`Referral reward credited to ${referrer.email}`);
        }
      }

      // 2. Debit the BUYER (if they used rewards)
      if (booking.rewardsUsed > 0) {
        // We find the user who booked (req.user isn't available in webhook-ish context, use booking.bookedBy[0])
        const buyerId = booking.bookedBy[0];
        const buyer = await User.findById(buyerId);
        if (buyer) {
          // Deduct (ensure we don't go below 0, though logic prevents it)
          buyer.referralRewards = Math.max(0, (buyer.referralRewards || 0) - booking.rewardsUsed);
          await buyer.save();
          console.log(`Deducted ₹${booking.rewardsUsed} from user ${buyer.email}`);
        }
      }

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
