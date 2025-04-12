import express from 'express';
import { authenticateToken } from '../middleware/jwtAuth.js';
import { getMessages, sendMessage, markAsRead, getChatMentors } from '../controllers/messageController.js';

const router = express.Router();

// Get all mentors that the user has chatted with
router.get('/chat-mentors', authenticateToken, getChatMentors);

// Get messages between two users
router.get('/:recipientId', authenticateToken, getMessages);

// Send a new message
router.post('/', authenticateToken, sendMessage);

// Mark messages as read
router.put('/:senderId/read', authenticateToken, markAsRead);

export default router;