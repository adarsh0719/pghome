const express = require('express');
const router = express.Router();
const { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty 
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const Property = require('../models/Property'); // ADD THIS IMPORT

// Use the same auth middleware consistently
router.route('/')
  .get(getProperties)
  .post(protect, uploadMultiple, createProperty);

router.route('/:id')
  .get(getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

// Delete property images - FIX: Remove require inside route
router.delete('/:id/images', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id); // Use imported Property
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user owns the property - FIX: Use _id
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Clear images array
    property.images = [];
    await property.save();

    res.json({ message: 'Images deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;