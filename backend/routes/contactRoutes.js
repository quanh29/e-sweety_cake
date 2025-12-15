import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactStatus,
  deleteContactMessage
} from '../controllers/contactController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

// Public route - anyone can send a contact message
router.post('/public', createContactMessage);

// Admin routes - protected
router.get('/', authenticateJWT, authorizeRoles('admin'), getAllContactMessages);
router.get('/:id', authenticateJWT, authorizeRoles('admin'), getContactMessageById);
router.patch('/:id', authenticateJWT, authorizeRoles('admin'), auditLogger('contact'), updateContactStatus);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), auditLogger('contact'), deleteContactMessage);

export default router;
