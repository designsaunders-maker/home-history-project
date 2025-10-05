import express from 'express';
import { auth } from '../middleware/auth';
import PropertyClaim from '../models/PropertyClaim';

const router = express.Router();

// Submit a new property claim
router.post('/', auth, async (req, res) => {
  try {
    const {
      address,
      location,
      verificationStatus,
      residencyDates
    } = req.body;

    // Check if user already has a claim for this address
    const existingClaim = await PropertyClaim.findOne({
      userId: req.user._id,
      address
    });

    if (existingClaim) {
      return res.status(400).json({
        message: 'You have already claimed this location'
      });
    }

    const claim = new PropertyClaim({
      userId: req.user._id,
      address,
      location,
      verificationStatus,
      residencyDates
    });

    await claim.save();

    res.status(201).json(claim);
  } catch (error) {
    console.error('Property claim error:', error);
    res.status(500).json({
      message: 'Error submitting property claim'
    });
  }
});

// Get user's property claims
router.get('/user', auth, async (req, res) => {
  try {
    const claims = await PropertyClaim.find({ userId: req.user._id });
    res.json(claims);
  } catch (error) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({
      message: 'Error fetching property claims'
    });
  }
});

// Get specific property claim
router.get('/:id', auth, async (req, res) => {
  try {
    const claim = await PropertyClaim.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!claim) {
      return res.status(404).json({
        message: 'Property claim not found'
      });
    }

    res.json(claim);
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({
      message: 'Error fetching property claim'
    });
  }
});

export default router;