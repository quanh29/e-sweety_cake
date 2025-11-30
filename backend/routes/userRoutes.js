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

const router = express.Router();

// All routes require authentication and admin role
router.get('/', authenticateJWT, authorizeRoles('admin'), getAllUsers);
router.get('/:id', authenticateJWT, authorizeRoles('admin'), getUserById);
router.post('/', authenticateJWT, authorizeRoles('admin'), createUser);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteUser);
router.patch('/:id/toggle-status', authenticateJWT, authorizeRoles('admin'), toggleUserStatus);

export default router;
