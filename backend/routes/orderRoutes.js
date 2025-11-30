import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating orders (no authentication required)
router.post('/public/orders', orderController.createPublicOrder);

// All order routes are protected and require at least 'user' role (which admin has)
router.use(authenticateJWT, authorizeRoles('user'));

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

export default router;
