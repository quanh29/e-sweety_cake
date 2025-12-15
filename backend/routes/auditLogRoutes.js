import express from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByResource,
  getAuditLogsByUser
} from '../controllers/auditLogController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.get('/', authenticateJWT, authorizeRoles('admin'), getAuditLogs);
router.get('/:id', authenticateJWT, authorizeRoles('admin'), getAuditLogById);
router.get('/resource/:resourceType/:resourceId', authenticateJWT, authorizeRoles('admin'), getAuditLogsByResource);
router.get('/user/:userId', authenticateJWT, authorizeRoles('admin'), getAuditLogsByUser);

export default router;
