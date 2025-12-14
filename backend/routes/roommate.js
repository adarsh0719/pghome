// routes/roommate.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const RoommateProfile = require('../models/RoommateProfile');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Property = require('../models/Property');
require('dotenv').config();

// Multer memory storage (we'll either upload to Cloudinary or convert to base64)
const upload = multer({ storage: multer.memoryStorage() }); // No size limit

// Import shared Cloudinary config
const { cloudinary } = require('../config/cloudinary');

// Create or update profile
router.post('/profile', authMiddleware, upload.array('images', 3), async (req, res) => {
  try {
    // body.habits expected as JSON string from frontend
    const {
      age, gender, budget, durationOfStay, bio, vibeScore,
      location, latitude, longitude, stayingInPG,
      currentPGId,
    } = req.body;


    let habits = {};
    try {
      habits = JSON.parse(req.body.habits || '{}');
    } catch (e) {
      // ignore parse error -> leave default
      habits = {};
    }

    // handle images: FORCE Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length) {
      console.log('Uploading', req.files.length, 'images to Cloudinary...');

      for (const f of req.files) {
        // Strict upload: if this fails, the whole request should probably fail, 
        // or at least we shouldn't fallback to base64.
        const uploaded = await uploadToCloudinaryBuffer(f);
        if (uploaded && uploaded.secure_url) {
          imageUrls.push(uploaded.secure_url);
        } else {
          throw new Error('Failed to upload image to Cloudinary');
        }
      }
    }

    const data = {
      age: Number(age),
      gender,
      budget: Number(budget),
      durationOfStay: Number(durationOfStay),
      bio,
      location: location || "",
      coordinates: {
        type: "Point",
        coordinates: [
          parseFloat(longitude) || 0,
          parseFloat(latitude) || 0
        ]
      },
      habits: {
        smoking: Boolean(habits.smoking),
        drinking: Boolean(habits.drinking),
        pets: Boolean(habits.pets),
        parties: Boolean(habits.parties),
        guests: Boolean(habits.guests),
        cleanliness: Number(habits.cleanliness || 3),
        sleepSchedule: habits.sleepSchedule || 'flexible'
      },
      vibeScore: Number(vibeScore || 5),
      images: imageUrls,
      stayingInPG: stayingInPG === 'true' || stayingInPG === true,
      currentPG: (stayingInPG === 'true' && currentPGId) ? currentPGId : null,
    };


    let profile = await RoommateProfile.findOne({ user: req.user._id });
    if (profile) {
      Object.assign(profile, data);
    } else {
      profile = new RoommateProfile({ user: req.user._id, ...data });
    }

    await profile.save();

    //  Save roommateProfile to User document
    await User.findByIdAndUpdate(req.user._id, {
      roommateProfile: profile._id
    });

    const populated = await profile.populate('user', 'name email roommateProfile');
    res.json(populated);

  } catch (err) {
    console.error('Profile save error:', err);
    res.status(500).json({ message: 'Server error while saving profile' });
  }
});

// helper: upload buffer to cloudinary using upload_stream wrapped in Promise
async function uploadToCloudinaryBuffer(file) {
  return new Promise((resolve, reject) => {
    if (!cloudinary) return resolve(null);
    const stream = cloudinary.uploader.upload_stream({ folder: 'roommate_profiles' }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(file.buffer);
  });
}

// Get existing profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await RoommateProfile.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .lean(); // Optimize with lean()
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alias /me to /profile
router.get('/me', authMiddleware, async (req, res) => {
  const start = Date.now();
  console.log('GET /me START', start);
  try {
    const profile = await RoommateProfile.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .lean(); // Optimize with lean()
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    console.log('GET /me Total took:', Date.now() - start, 'ms');
  }
});

// Get matches
// GET /matches?page=1&limit=10
router.get('/matches', authMiddleware, async (req, res) => {
  const start = Date.now();
  console.log('GET /matches START', start);
  try {
    const startProfile = Date.now();
    const myProfile = await RoommateProfile.findOne({ user: req.user._id }).lean();
    console.log('Fetch MyProfile took:', Date.now() - startProfile, 'ms');

    if (!myProfile) return res.status(400).json({ message: 'Create your profile first' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Build Aggregation Pipeline
    const pipeline = [];

    // 1. Geo-spatial Match (Must be first if used)
    if (myProfile.coordinates && myProfile.coordinates.coordinates &&
      (myProfile.coordinates.coordinates[0] !== 0 || myProfile.coordinates.coordinates[1] !== 0)) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: myProfile.coordinates.coordinates
          },
          distanceField: "distance",
          spherical: true,
          // maxDistance: 50000 // Optional: limit to 50km?
        }
      });
    }

    // 2. Exclude self
    pipeline.push({
      $match: {
        user: { $ne: req.user._id }
      }
    });

    // 3. Pagination (Apply early to reduce processing)
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // 4. Lookup User details
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    });
    pipeline.push({ $unwind: '$user' });

    // 5. Project only needed fields
    pipeline.push({
      $project: {
        images: 1, // Return all images
        'user.name': 1,
        'user.email': 1,
        'user._id': 1,
        age: 1,
        gender: 1,
        budget: 1,
        bio: 1,
        coordinates: 1,
        availableRooms: 1,
        lookingForRoommate: 1,
        location: 1,
        habits: 1,
        vibeScore: 1,
        distance: 1 // from geoNear
      }
    });

    const startCandidates = Date.now();
    const allProfiles = await RoommateProfile.aggregate(pipeline);
    console.log('Fetch Candidates (Agg) took:', Date.now() - startCandidates, 'ms');

    const startScoring = Date.now();
    const scoredProfiles = allProfiles
      .map((p) => {
        let score = 0;

        // Age & Budget
        score += Math.max(0, 20 - Math.abs(myProfile.age - p.age));
        score += Math.max(0, 10 - Math.abs(myProfile.budget - p.budget) / 1000);

        // Habits
        ['smoking', 'drinking', 'pets', 'parties', 'guests'].forEach(f => {
          if (myProfile.habits?.[f] === p.habits?.[f]) score += 5;
        });

        // Sleep schedule
        if ((myProfile.habits?.sleepSchedule || '') === (p.habits?.sleepSchedule || '')) score += 5;

        // Cleanliness
        score += Math.max(0, 5 - Math.abs((myProfile.habits?.cleanliness || 3) - (p.habits?.cleanliness || 3)));

        // Vibe score
        score += Math.max(0, 10 - Math.abs((myProfile.vibeScore || 5) - (p.vibeScore || 5)));

        // 🔥 Bonus if rooms available
        if (p.availableRooms && p.availableRooms > 0) {
          score += 15;
        }

        return {
          _id: p._id,
          compatibilityScore: Math.round(Math.max(0, score)),
          distance: p.distance ? Math.round(p.distance / 1000) : 0, // Convert meters to km
          profile: {
            _id: p._id,
            user: p.user,
            age: p.age,
            gender: p.gender,
            budget: p.budget,
            images: p.images || [],
            bio: p.bio,
            coordinates: p.coordinates,
            availableRooms: p.availableRooms,
            lookingForRoommate: p.lookingForRoommate,
            location: p.location
          }
        };
      });

    // Sort by compatibility
    scoredProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    console.log('Scoring took:', Date.now() - startScoring, 'ms');

    res.json({
      page,
      limit,
      results: scoredProfiles,
      hasMore: scoredProfiles.length === limit
    });
  } catch (err) {
    console.error('Match fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    console.log('GET /matches Total took:', Date.now() - start, 'ms');
  }
});

// Lazy Load Images
router.get('/profile/:userId/images', authMiddleware, async (req, res) => {
  try {
    const profile = await RoommateProfile.findOne({ user: req.params.userId }).select('images');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile.images || []);
  } catch (err) {
    console.error('Image fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile by user ID (for viewing others' profiles)
// Node.js / Express example
const Booking = require('../models/Booking');

// routes/roommate.js → GET /profile/:id

router.get('/profile/:id', async (req, res) => {
  try {
    const profileDoc = await RoommateProfile.findOne({ user: req.params.id })
      .populate('user', 'name email _id')
      .populate('currentPG'); // populate selected PG

    if (!profileDoc) return res.status(404).json({ message: "Profile not found" });

    const currentBooking = await Booking.findOne({
      bookedBy: req.params.id,
      status: 'paid'
    }).populate('property');

    const profile = profileDoc.toObject();

    // PRIORITY LOGIC
    if (currentBooking?.property) {
      profile.currentProperty = currentBooking.property; // Booked PG wins
    } else if (profile.currentPG) {
      profile.currentProperty = profile.currentPG;       // Selected in profile
      delete profile.currentPG; // optional: clean up
    } else {
      profile.currentProperty = null;
    }

    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/profile", authMiddleware, upload.array("images", 3), async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await RoommateProfile.findOne({ user: userId }).populate("user");

    if (!existing) return res.status(404).json({ message: "Profile not found" });

    // Update user name
    if (req.body.name) {
      const user = await User.findById(userId);
      user.name = req.body.name;
      await user.save();
      existing.user = user;
    }

    // Append new images
    // Append new images and remove marked ones
    // Append new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      for (const f of req.files) {
        const uploaded = await uploadToCloudinaryBuffer(f);
        if (uploaded && uploaded.secure_url) {
          newImageUrls.push(uploaded.secure_url);
        } else {
          throw new Error('Failed to upload image to Cloudinary (PUT)');
        }
      }
      existing.images = [...(existing.images || []), ...newImageUrls];
    }

    // Remove images by indices if provided
    if (req.body.removedIndices) {
      const indices = JSON.parse(req.body.removedIndices);
      existing.images = existing.images.filter((_, idx) => !indices.includes(idx));
    }


    existing.age = req.body.age || existing.age;
    existing.gender = req.body.gender || existing.gender;
    existing.budget = req.body.budget || existing.budget;
    existing.bio = req.body.bio || existing.bio;
    if (req.body.location) existing.location = req.body.location;

    if (req.body.latitude && req.body.longitude) {
      existing.coordinates = {
        type: "Point",
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      };
    }

    await existing.save();
    res.json(await existing.populate("user"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// routes/roommate.js  (add this route)
router.get('/pg-list', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    const searchTerm = search?.trim();

    // Default: Show all recent properties (limit 15 below)
    let query = {};

    // If user typed something, make search super smart
    if (searchTerm) {
      query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { 'location.city': { $regex: searchTerm, $options: 'i' } },
          { 'location.landmark': { $regex: searchTerm, $options: 'i' } },
          { 'location.address': { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    const pgs = await Property.find(query)
      .select('title location rent images type')
      .limit(15)
      .lean(); // important for performance

    // Normalize image URL to always work
    const normalized = pgs.map(pg => {
      let imageUrl = null;

      if (pg.images && pg.images.length > 0) {
        if (typeof pg.images[0] === 'string') {
          imageUrl = pg.images[0];
        } else if (pg.images[0]?.url) {
          imageUrl = pg.images[0].url;
        } else if (pg.images[0]?.path) {
          imageUrl = pg.images[0].path;
        }
      }

      return {
        ...pg,
        imageUrl // ← frontend will read this safely
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error('PG List Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//------------------------------------------------------
// AUTO-UPDATE LOCATION when user opens Roommate Finder
//------------------------------------------------------


router.put('/update-coordinates', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Coordinates missing" });
    }

    const profile = await RoommateProfile.findOne({ user: req.user._id });

    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    profile.coordinates = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };

    await profile.save();

    res.json({ message: "Coordinates updated", profile });
  } catch (err) {
    console.error("Update coordinates error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Anyone can say "I have rooms available"
router.put('/available-rooms', authMiddleware, async (req, res) => {
  try {
    const { availableRooms } = req.body;
    const profile = await RoommateProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.availableRooms = Number(availableRooms);
    // Automatically set lookingForRoommate based on availableRooms
    profile.lookingForRoommate = profile.availableRooms > 0;

    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle "Looking for Roommate"
router.put('/looking-for-roommate', authMiddleware, async (req, res) => {
  try {
    const { lookingForRoommate } = req.body;
    const profile = await RoommateProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.lookingForRoommate = Boolean(lookingForRoommate);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
