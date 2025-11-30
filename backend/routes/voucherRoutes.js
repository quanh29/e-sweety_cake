import express from 'express';
import {
    getAllVouchers,
    getVoucherByCode,
    createVoucher,
    toggleVoucherStatus,
    validateVoucher
} from '../controllers/voucherController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route - validate voucher
router.get('/validate/:code', validateVoucher);

// Protected routes - require authentication and admin role
router.get('/', authenticateJWT, authorizeRoles('admin'), getAllVouchers);
router.get('/:code', authenticateJWT, authorizeRoles('admin'), getVoucherByCode);
router.post('/', authenticateJWT, authorizeRoles('admin'), createVoucher);
router.patch('/:code/toggle', authenticateJWT, authorizeRoles('admin'), toggleVoucherStatus);

export default router;
