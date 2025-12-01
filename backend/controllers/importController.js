import StockEntry from '../models/StockEntry.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get all stock entries
export const getAllImports = async (req, res) => {
    try {
        const entries = await StockEntry.find()
            .populate('createdBy', 'fullName username')
            .populate('items.productId', 'name pictureUrl')
            .sort({ createdAt: -1 })
            .lean();

        const importsWithDetails = entries.map(entry => {
            const subtotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const total = subtotal + (entry.shippingFee || 0);

            return {
                id: entry._id.toString(),
                createdBy: entry.createdBy?._id?.toString() || null,
                creatorName: entry.createdBy?.fullName || 'Unknown',
                shippingFee: entry.shippingFee,
                subtotal,
                total,
                createdAt: entry.createdAt,
                items: entry.items.map(item => ({
                    productId: item.productId?._id?.toString() || item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.quantity * item.price
                }))
            };
        });

        res.json(importsWithDetails);
    } catch (error) {
        console.error('Get imports error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn nhập hàng' });
    }
};

// Get import by ID
export const getImportById = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await StockEntry.findById(id)
            .populate('createdBy', 'fullName username')
            .populate('items.productId', 'name pictureUrl')
            .lean();

        if (!entry) {
            return res.status(404).json({ message: 'Không tìm thấy đơn nhập hàng' });
        }

        const subtotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const total = subtotal + (entry.shippingFee || 0);

        const importData = {
            id: entry._id.toString(),
            createdBy: entry.createdBy?._id?.toString() || null,
            creatorName: entry.createdBy?.fullName || 'Unknown',
            shippingFee: entry.shippingFee,
            subtotal,
            total,
            createdAt: entry.createdAt,
            items: entry.items.map(item => ({
                productId: item.productId?._id?.toString() || item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price
            }))
        };

        res.json(importData);
    } catch (error) {
        console.error('Get import error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn nhập hàng' });
    }
};

// Create new stock entry
export const createImport = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { items, shippingFee } = req.body;
        const userId = req.user.id; // from authenticateJWT middleware

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Đơn nhập hàng phải có ít nhất một sản phẩm' });
        }

        // Validate and prepare items
        const entryItems = [];
        let subtotal = 0;
        
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.price) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' });
            }

            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Không tìm thấy sản phẩm ${item.productId}` });
            }

            // Update product stock
            product.stock += item.quantity;
            await product.save({ session });

            entryItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: item.price
            });

            subtotal += item.quantity * item.price;
        }

        // Create stock entry
        const newEntry = await StockEntry.create([{
            createdBy: userId,
            shippingFee: shippingFee || 0,
            items: entryItems
        }], { session });

        await session.commitTransaction();

        // Populate for response
        const populatedEntry = await StockEntry.findById(newEntry[0]._id)
            .populate('createdBy', 'fullName username')
            .populate('items.productId', 'name pictureUrl');

        const total = subtotal + (shippingFee || 0);

        const newImport = {
            id: populatedEntry._id.toString(),
            createdBy: userId,
            creatorName: populatedEntry.createdBy?.fullName || 'Unknown',
            shippingFee: populatedEntry.shippingFee,
            subtotal,
            total,
            createdAt: populatedEntry.createdAt,
            items: populatedEntry.items.map(item => ({
                productId: item.productId._id.toString(),
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price
            }))
        };

        res.status(201).json(newImport);
    } catch (error) {
        await session.abortTransaction();
        console.error('Create import error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo đơn nhập hàng' });
    } finally {
        session.endSession();
    }
};

// Delete stock entry
export const deleteImport = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = req.params;

        const entry = await StockEntry.findById(id).session(session);
        if (!entry) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Không tìm thấy đơn nhập hàng' });
        }

        // Reverse stock updates
        for (const item of entry.items) {
            const product = await Product.findById(item.productId).session(session);
            if (product) {
                product.stock -= item.quantity;
                await product.save({ session });
            }
        }

        // Delete stock entry
        await StockEntry.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        res.json({ message: 'Xóa đơn nhập hàng thành công' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Delete import error:', error);
        res.status(500).json({ message: 'Lỗi khi xóa đơn nhập hàng' });
    } finally {
        session.endSession();
    }
};

// Update stock entry
export const updateImport = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = req.params;
        const { items, shippingFee } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Đơn nhập hàng phải có ít nhất một sản phẩm' });
        }

        const entry = await StockEntry.findById(id).session(session);
        if (!entry) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Không tìm thấy đơn nhập hàng' });
        }

        // Reverse old stock updates
        for (const oldItem of entry.items) {
            const product = await Product.findById(oldItem.productId).session(session);
            if (product) {
                product.stock -= oldItem.quantity;
                await product.save({ session });
            }
        }

        // Validate and prepare new items
        const entryItems = [];
        let subtotal = 0;
        
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.price) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' });
            }

            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Không tìm thấy sản phẩm ${item.productId}` });
            }

            // Update product stock with new quantity
            product.stock += item.quantity;
            await product.save({ session });

            entryItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: item.price
            });

            subtotal += item.quantity * item.price;
        }

        // Update stock entry
        entry.shippingFee = shippingFee || 0;
        entry.items = entryItems;
        await entry.save({ session });

        await session.commitTransaction();

        // Populate for response
        const populatedEntry = await StockEntry.findById(id)
            .populate('createdBy', 'fullName username')
            .populate('items.productId', 'name pictureUrl');

        const total = subtotal + (shippingFee || 0);

        const updatedImport = {
            id: populatedEntry._id.toString(),
            createdBy: populatedEntry.createdBy?._id?.toString() || null,
            creatorName: populatedEntry.createdBy?.fullName || 'Unknown',
            shippingFee: populatedEntry.shippingFee,
            subtotal,
            total,
            createdAt: populatedEntry.createdAt,
            items: populatedEntry.items.map(item => ({
                productId: item.productId._id.toString(),
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.quantity * item.price
            }))
        };

        res.json(updatedImport);
    } catch (error) {
        await session.abortTransaction();
        console.error('Update import error:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật đơn nhập hàng' });
    } finally {
        session.endSession();
    }
};
