import express from 'express';
import { register, login, refresh, logout, getCurrentUser } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticateJWT, getCurrentUser);
router.post('/logout', logout);

export default router;
