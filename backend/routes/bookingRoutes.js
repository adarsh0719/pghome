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


// --- NEW: Request Booking (No Payment Yet) ---
router.post('/request-booking', protect, async (req, res) => {
  try {
    const { propertyId, type, months, partnerEmail, referralCode, useRewards } = req.body;

    const property = await Property.findById(propertyId).populate('owner');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const basePrice = property.rent * months;
    let totalAmount = type === 'double' ? basePrice * 2 : basePrice;

    // --- BROKER / RESELLER LOGIC ---
    let commissionAmount = 0;
    const { brokerId } = req.body;
    const BrokerListing = require('../models/BrokerListing');

    if (brokerId) {
      const brokerListing = await BrokerListing.findOne({ broker: brokerId, property: propertyId });
      if (brokerListing && brokerListing.isActive) {
        // Use Broker's Price
        const brokerBasePrice = brokerListing.price * months;
        const originalPrice = totalAmount; // This is the owner's price calculated earlier

        // Override totalAmount with Broker's price
        totalAmount = type === 'double' ? brokerBasePrice * 2 : brokerBasePrice;

        // Commission is validity check
        if (totalAmount > originalPrice) {
          commissionAmount = totalAmount - originalPrice;
        }
      }
    }

    // --- REFERRAL DISCOUNT ---
    let discountAmount = 0;
    let validReferralCode = null;

    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer && referrer._id.toString() !== req.user._id.toString()) {
        discountAmount = 500;
        validReferralCode = referralCode.toUpperCase();
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }
    }

    // --- REWARDS REDEMPTION ---
    let rewardsUsed = 0;
    if (useRewards && req.user.referralRewards > 0) {
      rewardsUsed = Math.min(totalAmount, req.user.referralRewards);
      totalAmount = Math.max(0, totalAmount - rewardsUsed);
    }

    const bookedBy = [req.user._id];
    if (type === 'double' && partnerEmail) {
      const partner = await User.findOne({ email: partnerEmail });
      if (!partner) return res.status(400).json({ message: 'Partner email not found' });
      bookedBy.push(partner._id);
    }

    const booking = await Booking.create({
      property: property._id,
      owner: property.owner._id,
      bookedBy,
      type,
      months,
      totalAmount,
      status: 'pending',
      approvalStatus: 'pending', // Waiting for owner
      referralCodeApplied: validReferralCode,
      discountAmount,
      rewardsUsed,
      isReferralRewardClaimed: false,
      brokerId,
      commissionAmount
    });

    res.json({ message: 'Booking request sent to owner!', bookingId: booking._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Booking request failed' });
  }
});

// --- UPDATED: Create Checkout Session (Handles New & Approved Bookings) ---
router.post('/create-session', protect, async (req, res) => {
  try {
    const { bookingId } = req.body; // Check if paying for existing booking

    let booking;
    let property;
    let totalAmount;
    let type;
    let months;

    if (bookingId) {
      // PAYING FOR APPROVED BOOKING
      booking = await Booking.findById(bookingId).populate('property');
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      if (booking.approvalStatus !== 'approved') return res.status(400).json({ message: 'Booking not approved yet' });

      property = booking.property;
      totalAmount = booking.totalAmount;
      type = booking.type;
      months = booking.months;

    } else {
      // LEGACY / DIRECT BOOKING (If needed, or error out)
      return res.status(400).json({ message: 'Use request-booking first' });
    }

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


// Owner Actions: Approve/Reject
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.approvalStatus = status;
    await booking.save();
    res.json({ message: `Booking ${status}`, booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});


// Verify Payment and Generate Coupon (and Handle Referral Rewards)
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

      // Update vacancies
      // We check vacancy count to prevent going below 0 (though payment should ideally be blocked earlier if full)
      const vacancyType = booking.type === 'pg' ? null : booking.type; // 'single' or 'double' usually stored in type for rooms? 
      // Wait, booking.type is 'single' or 'double' based on "Request Booking" payload?
      // Let's check request-booking payload: 'type' comes from body. 
      // In Property model enum is 'pg', 'flat', 'room', 'hostel'.
      // But Booking model 'type' seems to be the room type (single/double) selected by user?
      // Checking BookingCheckOut.js: User selects 'single' or 'double'.
      // So booking.type is 'single' or 'double'.
      if (booking.property && booking.property.vacancies) {
        if (booking.type === 'single' && booking.property.vacancies.single > 0) {
          booking.property.vacancies.single -= 1;
        } else if (booking.type === 'double' && booking.property.vacancies.double > 0) {
          booking.property.vacancies.double -= 1;
        }
        await booking.property.save();
      }

      // 1. Credit the REFERRER (if a code was used)
      if (booking.referralCodeApplied && !booking.isReferralRewardClaimed) {
        const referrer = await User.findOne({ referralCode: booking.referralCodeApplied });
        if (referrer) {
          referrer.referralRewards = (referrer.referralRewards || 0) + 500;
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

      // 3. Credt REWARDS to BROKER
      if (booking.brokerId && booking.commissionAmount > 0) {
        const broker = await User.findById(booking.brokerId);
        if (broker) {
          broker.referralRewards = (broker.referralRewards || 0) + booking.commissionAmount;
          await broker.save();
          console.log(`Commission of ₹${booking.commissionAmount} credited to broker ${broker.email}`);
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
  try {
    const bookings = await Booking.find({ owner: req.params.ownerId })
      .populate('property')
      .populate('bookedBy', 'name email kycStatus kycDocument');

    // Hide broker markup from owner
    const adjustedBookings = bookings.map(booking => {
      const b = booking.toObject();
      if (b.commissionAmount > 0) {
        b.totalAmount = b.totalAmount - b.commissionAmount;
      }
      return b;
    });

    res.json(adjustedBookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching owner bookings' });
  }
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


// Get Logged In User's Bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.user._id })
      .populate('property')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

module.exports = router;
