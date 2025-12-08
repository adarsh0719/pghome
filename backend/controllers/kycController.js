const Kyc = require('../models/Kyc');
const User = require('../models/User');
const crypto = require('crypto');
const { generateUniqueReferralCode } = require('../utils/referralUtils');

const maskAadhaar = (a) => '**** **** ' + a.slice(-4);
const hashAadhaar = (a) =>
  crypto.createHash('sha256').update(a).digest('hex');

exports.submitKyc = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log(userId);
    const { aadhaar } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar))
      return res.status(400).json({ message: 'Invalid Aadhaar number' });

    if (!req.files || !req.files.front || !req.files.back)
      return res.status(400).json({ message: 'Front and back images required' });

    const front = req.files.front[0];
    const back = req.files.back[0];

    const kyc = await Kyc.create({
      user: userId,
      aadhaarMasked: maskAadhaar(aadhaar),
      aadhaarHash: hashAadhaar(aadhaar),
      frontImageUrl: front.path,
      backImageUrl: back.path,
    });

    await User.findByIdAndUpdate(userId, {
      kycStatus: 'pending',
      kycId: kyc._id,
    });

    res.json({ message: 'KYC submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingKyc = async (req, res) => {
  try {
    const kycs = await Kyc.find({ status: 'pending' }).populate('user', 'name email');
    res.json(kycs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reviewKyc = async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action))
      return res.status(400).json({ message: 'Invalid action' });

    const kyc = await Kyc.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });

    kyc.status = action === 'approve' ? 'approved' : 'rejected';
    kyc.adminId = req.user._id;
    kyc.reviewedAt = new Date();
    if (action === 'reject') kyc.rejectedReason = reason;
    await kyc.save();

    const updateData = { kycStatus: kyc.status };

    // Generate referral code on approval
    if (action === 'approve') {
      const code = await generateUniqueReferralCode();
      updateData.referralCode = code;
    }

    await User.findByIdAndUpdate(kyc.user, updateData);

    res.json({ message: `KYC ${action}ed successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
