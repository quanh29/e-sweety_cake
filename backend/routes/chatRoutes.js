import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { 
    sendChatMessage, 
    getConversations, 
    getConversationMessages,
    deleteConversation 
} from '../controllers/chatController.js';

const router = express.Router();

// Rate limiter for chat messages (5 requests per 1 minutes per IP)
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Public route - Send chat message (with rate limiting)
router.post('/send', chatLimiter, sendChatMessage);

// Admin routes - View chat history
router.get('/conversations', authenticateJWT, authorizeRoles('admin'), getConversations);
router.get('/conversations/:id', authenticateJWT, authorizeRoles('admin'), getConversationMessages);
router.delete('/conversations/:id', authenticateJWT, authorizeRoles('admin'), deleteConversation);

export default router;
