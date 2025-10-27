const express = require('express');
const router = express.Router();
const upload = require('../config/kycUpload'); // ✅ correct import
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const kycController = require('../controllers/kycController');
console.log(typeof auth, typeof adminAuth, typeof upload.fields);

// ✅ USER submits KYC
router.post(
  '/submit',
  auth,
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  kycController.submitKyc
);

// ✅ ADMIN views pending KYCs
router.get('/pending', adminAuth, kycController.getPendingKyc);

// ✅ ADMIN reviews (approve/reject) KYCs
router.post('/:id/review', adminAuth, kycController.reviewKyc);

module.exports = router;
