import * as productService from '../services/productService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Public controllers (no authentication required)
export const getPublicProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

export const getPublicProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// Authenticated user controllers
export const getProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const newProduct = await productService.createProduct({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            imageUrl
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const productData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            imageUrl
        };

        const success = await productService.updateProduct(req.params.id, productData);
        
        if (success) {
            const updatedProduct = await productService.getProductById(req.params.id);
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productService.getProductById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const success = await productService.deleteProduct(productId);

        if (success) {
            // If product has an image, delete it from the uploads folder
            if (product.picture_url) {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                // picture_url is stored as /uploads/filename.ext
                // We need to go up one directory from controllers to the backend root
                const imagePath = path.join(__dirname, '..', product.picture_url);
                
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        // Log the error but don't block the response, 
                        // as the product is already deleted from DB.
                        console.error(`Failed to delete image: ${imagePath}`, err);
                    } else {
                        console.log(`Deleted image: ${imagePath}`);
                    }
                });
            }
            res.status(204).send();
        } else {
            // This case might be redundant if we already check for product existence
            res.status(404).json({ message: 'Product not found or could not be deleted' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};
