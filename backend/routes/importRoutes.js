import express from 'express';
import {
    getAllImports,
    getImportById,
    createImport,
    updateImport,
    deleteImport
} from '../controllers/importController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.get('/', authenticateJWT, authorizeRoles('admin'), getAllImports);
router.get('/:id', authenticateJWT, authorizeRoles('admin'), getImportById);
router.post('/', authenticateJWT, authorizeRoles('admin'), createImport);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), updateImport);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteImport);

export default router;
