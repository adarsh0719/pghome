// controllers/userController.js
const User = require('../models/User');

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload KYC documents
exports.uploadKYC = async (req, res) => {
  const { kycDocuments } = req.body;

  try {
    const user = await User.findById(req.user.id).select('-password');

    user.kycDocuments = kycDocuments;
    user.kycStatus = 'pending';

    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update broker listing details
exports.updateBrokerListing = async (req, res) => {
  const BrokerListing = require('../models/BrokerListing');
  try {
    const { propertyId, price, description, facilities, isActive, packages } = req.body;

    // Build update object
    const updateFields = {
      broker: req.user.id
    };

    if (propertyId) updateFields.property = propertyId;
    if (price) updateFields.price = price;
    if (description) updateFields.description = description;
    if (facilities) updateFields.facilities = Array.isArray(facilities) ? facilities : facilities ? facilities.split(',') : undefined;
    if (typeof isActive !== 'undefined') updateFields.isActive = isActive;

    // Handle Packages
    if (packages) {
      try {
        const parsedPackages = typeof packages === 'string' ? JSON.parse(packages) : packages;
        if (Array.isArray(parsedPackages)) {
          updateFields.packages = parsedPackages;
        }
      } catch (e) {
        console.error("Error parsing packages", e);
      }
    }

    // Handle Images: Merge keptImages and new uploads
    let finalImages = [];

    // 1. Process keptImages (JSON string from frontend)
    if (req.body.keptImages) {
      try {
        const kept = JSON.parse(req.body.keptImages);
        if (Array.isArray(kept)) {
          finalImages = kept;
        }
      } catch (e) {
        console.error("Error parsing keptImages", e);
      }
    }

    // 2. Add new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      finalImages = [...finalImages, ...newImages];
    }

    // Only update images field if we have a definitive list (either kept or new or both)
    // If keptImages field was sent, it implies an intent to manage images.
    if (req.body.keptImages || (req.files && req.files.length > 0)) {
      updateFields.images = finalImages;
    }

    const listing = await BrokerListing.findOneAndUpdate(
      { broker: req.user.id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error.toString() });
  }
};

// @desc    Delete broker listing
exports.deleteBrokerListing = async (req, res) => {
  const BrokerListing = require('../models/BrokerListing');
  try {
    const listing = await BrokerListing.findOneAndDelete({ broker: req.user.id });
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get broker listing details
exports.getBrokerListing = async (req, res) => {
  const BrokerListing = require('../models/BrokerListing');
  try {
    const listing = await BrokerListing.findOne({ broker: req.user.id }).populate('property');
    // If no listing, return null or empty object, don't 404
    res.json(listing || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get broker listing by User ID (Public/Protected)
exports.getBrokerListingByUserId = async (req, res) => {
  const BrokerListing = require('../models/BrokerListing');
  try {
    const listing = await BrokerListing.findOne({ broker: req.params.userId, isActive: true }).populate('property');
    res.json(listing || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};