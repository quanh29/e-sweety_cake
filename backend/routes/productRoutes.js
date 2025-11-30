import express from 'express';
import multer from 'multer';
import path from 'path';
import * as productController from '../controllers/productController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Public routes (no authentication required)
router.get('/public/products', productController.getPublicProducts);
router.get('/public/products/:id', productController.getPublicProduct);

// user routes
router.get('/', authenticateJWT, authorizeRoles('user'), productController.getProducts);
router.get('/:id', authenticateJWT, authorizeRoles('user'), productController.getProduct);

// Admin routes
router.post('/', authenticateJWT, authorizeRoles('admin'), upload.single('image'), productController.createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), productController.deleteProduct);

export default router;
