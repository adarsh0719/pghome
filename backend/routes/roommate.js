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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }); // 5MB limit

// Optional: Cloudinary setup (if you set CLOUDINARY_URL or config below)
let cloudinary = null;
try {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} catch (e) {
  // cloudinary not configured; we'll fallback to base64 data URIs
  cloudinary = null;
}


// Create or update profile
router.post('/profile', authMiddleware, upload.array('images', 3), async (req, res) => {
  try {
    // body.habits expected as JSON string from frontend
    const {
  age, gender, budget, durationOfStay, bio, vibeScore,
  location, latitude, longitude,stayingInPG,
  currentPGId,
} = req.body;


    let habits = {};
    try {
      habits = JSON.parse(req.body.habits || '{}');
    } catch (e) {
      // ignore parse error -> leave default
      habits = {};
    }

    // handle images: prefer Cloudinary if configured
    let imageUrls = [];
    if (req.files && req.files.length) {
      if (cloudinary && process.env.CLOUDINARY_UPLOAD_PRESET) {
        // upload sequentially (for simplicity). In production consider parallel and error handling.
        for (const f of req.files) {
          const uploaded = await cloudinary.uploader.upload_stream_async
            ? await uploadToCloudinaryBuffer(f) // custom helper below
            : await cloudinary.uploader.upload_stream({ resource_type: 'image' }); // fallback (should not reach)
          if (uploaded && uploaded.secure_url) imageUrls.push(uploaded.secure_url);
        }
      } else if (cloudinary) {
        // cloudinary configured without helper - use uploadStream below
        for (const f of req.files) {
          const uploaded = await uploadToCloudinaryBuffer(f);
          if (uploaded && uploaded.secure_url) imageUrls.push(uploaded.secure_url);
        }
      } else {
        // fallback: store as base64 data URI (not recommended for production)
        imageUrls = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
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
    const profile = await RoommateProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get matches
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    if (!myProfile) return res.status(400).json({ message: 'Create your profile first' });

    const allProfiles = await RoommateProfile.find({ user: { $ne: req.user._id } }).populate('user', 'name email');

    const scoredProfiles = allProfiles
      .filter(p => p.user) // remove profiles without user
      .map((p) => {
        let score = 0;

        // Age: prefer similar ages — clamp difference into 0..10
        score += Math.max(0, 10 - Math.abs(myProfile.age - p.age));

        // Budget: normalize by 1000 to avoid huge differences
        score += Math.max(0, 10 - Math.abs(myProfile.budget - p.budget) / 1000);

        // Matching boolean habits
        ['smoking', 'drinking', 'pets', 'parties', 'guests'].forEach((f) => {
          if (myProfile.habits?.[f] === p.habits?.[f]) score += 3;
        });

        // Sleep schedule exact match
        if ((myProfile.habits?.sleepSchedule || '') === (p.habits?.sleepSchedule || '')) score += 5;

        // Cleanliness: small penalty for difference, max +5
        score += Math.max(0, 5 - Math.abs((myProfile.habits?.cleanliness || 3) - (p.habits?.cleanliness || 3)));

        // Vibe
        score += Math.max(0, 10 - Math.abs((myProfile.vibeScore || 5) - (p.vibeScore || 5)));

        // Gender preference could be added later

        return { profile: p, compatibilityScore: Math.round(Math.max(0, score)) };
      });
    
    scoredProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    res.json(scoredProfiles);
  } catch (err) {
    console.error('Match fetch error:', err);
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
if (req.files && req.files.length > 0) {
  const newImages = req.files.map(
    (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
  );
  existing.images = [...(existing.images || []), ...newImages];
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

    // Build a flexible query that works no matter how your properties are saved
    let query = {
      $or: [
        { type: { $regex: /pg|hostel|paying/i } }, // matches PG, pg, Hostel, Paying Guest
        { title: { $regex: /pg|hostel|paying guest/i } },
        { "location.city": { $regex: /bangalore|pune|hyderabad|delhi|mumbai/i } } // optional: common cities
      ]
    };

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


module.exports = router;
