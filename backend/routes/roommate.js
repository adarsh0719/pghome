const express = require('express');
const router = express.Router();
const RoommateProfile = require('../models/RoommateProfile');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// ✅ Middleware to check premium subscription
const checkPremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.subscription.active || user.subscription.plan !== 'premium') {
      return res.status(403).json({
        message: 'This feature is available only for users of 299 plan. Please upgrade your plan.'
      });
    }

    // Check if subscription expired
    if (user.subscription.expiresAt && new Date(user.subscription.expiresAt) < new Date()) {
      return res.status(403).json({
        message: 'Your subscription has expired. Please renew your premium plan.'
      });
    }

    next();
  } catch (err) {
    console.error('Premium check failed:', err);
    res.status(500).json({ message: 'Server error during subscription check' });
  }
};

// ✅ Create or update profile (premium-only)
router.post('/profile', authMiddleware, checkPremium, async (req, res) => {
  try {
    const { age, budget, habits, vibeScore } = req.body;
    let profile = await RoommateProfile.findOne({ user: req.user._id });

    if (profile) {
      profile.age = age;
      profile.budget = budget;
      profile.habits = habits;
      profile.vibeScore = vibeScore;
    } else {
      profile = new RoommateProfile({
        user: req.user._id,
        age,
        budget,
        habits,
        vibeScore
      });
    }

    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error('Profile save error:', err);
    res.status(500).json({ message: 'Server error while saving profile' });
  }
});

// ✅ Get existing profile (to auto-skip form)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await RoommateProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Fetch best matches (premium-only)
router.get('/matches', authMiddleware, checkPremium, async (req, res) => {
  try {
    const myProfile = await RoommateProfile.findOne({ user: req.user._id });
    if (!myProfile) return res.status(400).json({ message: 'Create your profile first' });

    const allProfiles = await RoommateProfile.find({ user: { $ne: req.user._id } }).populate('user', 'name email');

    const scoredProfiles = allProfiles
  .filter(p => p.user) // <-- remove profiles with null user
  .map((p) => {
    let score = 0;
    score += 10 - Math.abs(myProfile.age - p.age);
    score += 10 - Math.abs(myProfile.budget - p.budget) / 1000;
    if (myProfile.habits.smoking === p.habits.smoking) score += 5;
    if (myProfile.habits.drinking === p.habits.drinking) score += 5;
    if (myProfile.habits.pets === p.habits.pets) score += 5;
    score += 5 - Math.abs(myProfile.habits.cleanliness - p.habits.cleanliness);
    score += 10 - Math.abs(myProfile.vibeScore - p.vibeScore);

    return { profile: p, compatibilityScore: Math.max(0, Math.round(score)) };
  });


    scoredProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    res.status(200).json(scoredProfiles);
  } catch (err) {
    console.error('Match fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
