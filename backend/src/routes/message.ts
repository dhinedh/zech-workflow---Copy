
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getChannels,
    createChannel,
    getMessages,
    sendMessage,
    getUsers
} from '../controllers/messageController.js';

const router = express.Router();

router.use(authenticate);

router.get('/channels', getChannels);
router.post('/channels', createChannel);
router.get('/channels/:channelId/messages', getMessages);
router.post('/messages', sendMessage);
router.get('/users', getUsers); // Helper to fetch users for creating DMs

export default router;
