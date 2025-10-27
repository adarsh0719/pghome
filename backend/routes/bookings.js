const express = require('express');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all bookings for a user
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property', 'title images location rent type')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for property owners
router.get('/owner-bookings', protect, async (req, res) => {
  try {
    if (req.user.userType !== 'owner') {
      return res.status(403).json({ message: 'Only property owners can access this endpoint' });
    }

    const bookings = await Booking.find({ owner: req.user._id })
      .populate('property', 'title images location rent type')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new booking
router.post('/', protect, [
  
  body('propertyId').notEmpty().withMessage('Property ID is required'),
 body('checkIn')
  .isISO8601()
  .withMessage('Valid check-in date is required')
  .toDate(),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 month')
], async (req, res) => {
  try {
       console.log("🧾 Booking request body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, checkIn, duration, specialRequests, emiPlan } = req.body;

    // Check if property exists and is available
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.availability !== 'available') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own property' });
    }

    // Calculate total amount
    const totalAmount = property.rent * duration;
    const securityDeposit = property.securityDeposit || Math.round(property.rent * 1.5);

    // Check if user has active subscription
    const user = await User.findById(req.user._id);
    if (!user.subscription?.active) {
      return res.status(400).json({ 
        message: 'Active subscription required to book properties. Please subscribe first.' 
      });
    }

    // Create booking
    const booking = await Booking.create({
      property: propertyId,
      user: req.user._id,
      owner: property.owner,
      checkIn: new Date(checkIn),
      duration,
      totalAmount,
      securityDeposit,
      specialRequests,
      emiPlan: emiPlan && totalAmount > 25000 ? {
        enabled: true,
        tenure: 3,
        monthlyAmount: Math.round(totalAmount / 3),
        processingFee: Math.round(totalAmount * 0.02)
      } : { enabled: false }
    });

    // Populate the booking with property and owner details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title images location rent type amenities')
      .populate('owner', 'name email phone')
      .populate('user', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status (for owners)
router.put('/:id/status', protect, [
  body('status').isIn(['confirmed', 'cancelled', 'rejected', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the owner of the property
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update booking status
    booking.status = status;
    
    if (status === 'cancelled' && cancellationReason) {
      booking.cancellationReason = cancellationReason;
      
      // Calculate refund if payment was made
      if (booking.paymentStatus === 'paid') {
        booking.refundAmount = booking.calculateRefund;
        booking.paymentStatus = 'refunded';
      }
    }

    // If booking is confirmed, update property availability
    if (status === 'confirmed') {
      await Property.findByIdAndUpdate(booking.property, { 
        availability: 'occupied' 
      });
    }

    // If booking is cancelled or rejected, make property available again
    if (status === 'cancelled' || status === 'rejected') {
      await Property.findByIdAndUpdate(booking.property, { 
        availability: 'available' 
      });
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title images location rent type')
      .populate('user', 'name email phone')
      .populate('owner', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking (for users)
router.put('/:id/cancel', protect, [
  body('cancellationReason').notEmpty().withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the one who made the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking cannot be cancelled in its current status' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;

    // Calculate refund if payment was made
    if (booking.paymentStatus === 'paid') {
      booking.refundAmount = booking.calculateRefund;
      booking.paymentStatus = 'refunded';
    }

    // Make property available again
    await Property.findByIdAndUpdate(booking.property, { 
      availability: 'available' 
    });

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title images location rent type')
      .populate('owner', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location rent type amenities')
      .populate('user', 'name email phone')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString() && 
        booking.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;