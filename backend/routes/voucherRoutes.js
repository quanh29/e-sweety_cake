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
router.get('/', authenticateJWT, authorizeRoles('user'), getAllVouchers);
router.get('/:code', authenticateJWT, authorizeRoles('user'), getVoucherByCode);
router.post('/', authenticateJWT, authorizeRoles('user'), createVoucher);
router.patch('/:code/toggle', authenticateJWT, authorizeRoles('user'), toggleVoucherStatus);

export default router;
