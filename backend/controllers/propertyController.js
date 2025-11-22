const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get all properties
exports.getProperties = async (req, res) => {
  try {
    // Build query based on filters
    let query = {};

    // Filter by location (city)
    if (req.query.city) {
      query['location.city'] = new RegExp(req.query.city, 'i');
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by rent range
    if (req.query.minRent || req.query.maxRent) {
      query.rent = {};
      if (req.query.minRent) query.rent.$gte = parseInt(req.query.minRent);
      if (req.query.maxRent) query.rent.$lte = parseInt(req.query.maxRent);
    }

    // Filter by amenities
    if (req.query.amenities) {
      const amenitiesArray = req.query.amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }
    // Filter by minimum rating
if (req.query.minRating) {
  const min = Number(req.query.minRating);
  query["rating.average"] = { $gte: min };
}


    const properties = await Property.find(query).populate('owner', 'name email phone');
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/properties/:id
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a property
exports.createProperty = async (req, res) => {
  try {
    // Check if user is an owner
    if (req.user.userType !== 'owner') {
      return res.status(403).json({ message: 'Only owners can create properties' });
    }

    // Extract image data from Cloudinary if files are uploaded
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    })) : [];

    // Prepare property data
    const propertyData = {
      ...req.body,
      owner: req.user.id,
      images: images
    };

    // Parse amenities and rules if they're strings (from form data)
    if (typeof req.body.amenities === 'string') {
      propertyData.amenities = JSON.parse(req.body.amenities);
    }
    if (typeof req.body.rules === 'string') {
      propertyData.rules = JSON.parse(req.body.rules);
    }

    // Convert rent and securityDeposit to numbers
    if (propertyData.rent) {
      propertyData.rent = Number(propertyData.rent);
    }
    if (propertyData.securityDeposit) {
      propertyData.securityDeposit = Number(propertyData.securityDeposit);
    }

    const property = new Property(propertyData);
    await property.save();

    // Also add the property to the owner's properties array
await User.findByIdAndUpdate(
  req.user._id, // FIX: Use _id instead of id
  { $addToSet: { properties: property._id } },
  { new: true }
);

    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Update a property

exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if the logged in user is the owner of the property
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if the logged in user is the owner of the property
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);

    // Also remove the property from the owner's properties array
    await User.findByIdAndUpdate(req.user.id, { $pull: { properties: property._id } });

    res.json({ message: 'Property removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};