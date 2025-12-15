import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
} from '../controllers/userController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

// All routes require authentication and admin role
router.get('/', authenticateJWT, authorizeRoles('user'), getAllUsers);
router.get('/:id', authenticateJWT, authorizeRoles('admin'), getUserById);
router.post('/', authenticateJWT, authorizeRoles('admin'), auditLogger('user'), createUser);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), auditLogger('user'), updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), auditLogger('user'), deleteUser);
router.patch('/:id/toggle-status', authenticateJWT, authorizeRoles('admin'), auditLogger('user'), toggleUserStatus);

export default router;
