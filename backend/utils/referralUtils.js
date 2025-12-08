const crypto = require('crypto');
const User = require('../models/User');

/**
 * Generate a unique 6-character alphanumeric referral code
 * Recursive ensures uniqueness
 */
const generateUniqueReferralCode = async () => {
    let isUnique = false;
    let code = '';

    while (!isUnique) {
        // Generate random bytes and convert to hex, then slice to 6 chars
        code = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();

        // Check if exists
        const existing = await User.findOne({ referralCode: code });
        if (!existing) {
            isUnique = true;
        }
    }
    return code;
};

module.exports = {
    generateUniqueReferralCode
};
