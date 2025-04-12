import express from 'express';
import { authenticateToken } from '../middleware/jwtAuth.js';
import { getUserProfile, updateUserProfile } from '../controllers/userProfileController.js';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, getUserProfile);

// Update user profile
router.put('/', authenticateToken, updateUserProfile);

export default router; 