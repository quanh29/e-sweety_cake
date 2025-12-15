import express from 'express';
import {
    getAllImports,
    getImportById,
    createImport,
    updateImport,
    deleteImport
} from '../controllers/importController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

// All routes require authentication and admin role
router.get('/', authenticateJWT, authorizeRoles('user'), getAllImports);
router.get('/:id', authenticateJWT, authorizeRoles('user'), getImportById);
router.post('/', authenticateJWT, authorizeRoles('user'), auditLogger('import'), createImport);
router.put('/:id', authenticateJWT, authorizeRoles('user'), auditLogger('import'), updateImport);
router.delete('/:id', authenticateJWT, authorizeRoles('user'), auditLogger('import'), deleteImport);

export default router;
