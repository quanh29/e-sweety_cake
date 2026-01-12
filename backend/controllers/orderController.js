import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Public controller for creating orders (no authentication required)
export const createPublicOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {
            customerName, customerPhone, customerAddress, note,
            shippingFee, voucherCode, items, paymentMethod
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate and prepare items with product details
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            
            // if (product.stock < item.quantity) {
            //     await session.abortTransaction();
            //     return res.status(400).json({ 
            //         message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
            //     });
            // }

            // Reduce product stock
            // product.stock -= item.quantity;
            // await product.save({ session });

            orderItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Create order
        const newOrder = await Order.create([{
            customerName,
            phoneNumber: customerPhone,
            address: customerAddress,
            note: note || '',
            shippingFee: shippingFee || 0,
            voucherCode: voucherCode || null,
            paymentMethod: paymentMethod || 'cod',
            items: orderItems,
            status: 'pending',
            createdBy: null // Public order has no creator
        }], { session });

        await session.commitTransaction();

        // Populate product details for response
        const populatedOrder = await Order.findById(newOrder[0]._id).populate('items.productId', 'name pictureUrl');

        res.status(201).json({
            orderId: populatedOrder._id.toString(),
            customerName: populatedOrder.customerName,
            phoneNumber: populatedOrder.phoneNumber,
            address: populatedOrder.address,
            note: populatedOrder.note,
            shippingFee: populatedOrder.shippingFee,
            voucherCode: populatedOrder.voucherCode,
            paymentMethod: populatedOrder.paymentMethod,
            status: populatedOrder.status,
            items: populatedOrder.items.map(item => ({
                productId: item.productId._id.toString(),
                productName: item.productName,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: populatedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            total: populatedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + populatedOrder.shippingFee,
            createdAt: populatedOrder.createdAt
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Create public order error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        session.endSession();
    }
};


// Get all orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.productId', 'name pictureUrl')
            .populate('createdBy', 'fullName username')
            .sort({ createdAt: -1 })
            .lean();

        const ordersResponse = orders.map(order => {
            const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            // Note: discount is calculated on frontend based on voucher, backend only stores voucher_code
            const total = subtotal + order.shippingFee;

            return {
                order_id: order._id.toString(),
                customer_name: order.customerName,
                phone_number: order.phoneNumber,
                address: order.address,
                note: order.note,
                shipping_fee: order.shippingFee,
                voucher_code: order.voucherCode,
                payment_method: order.paymentMethod || 'cod',
                status: order.status,
                created_by: order.createdBy ? {
                    user_id: order.createdBy._id.toString(),
                    full_name: order.createdBy.fullName,
                    username: order.createdBy.username
                } : null,
                items: order.items.map(item => ({
                    prod_id: item.productId?._id?.toString() || item.productId,
                    product_name: item.productName,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal,
                total,
                created_at: order.createdAt
            };
        });

        res.json(ordersResponse);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new order (admin)
export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {
            customerName, customerPhone, customerAddress, customerNote,
            shippingFee, voucherCode, items, status, paymentMethod
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const createdBy = req.user.id;

        // Validate and prepare items (don't deduct stock yet - wait for confirmation)
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            
            // Check stock availability but don't deduct yet
            // if (product.stock < item.quantity) {
            //     await session.abortTransaction();
            //     return res.status(400).json({ 
            //         message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
            //     });
            // }

            orderItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Create order
        const newOrder = await Order.create([{
            customerName,
            phoneNumber: customerPhone,
            address: customerAddress,
            note: customerNote || '',
            shippingFee: shippingFee || 0,
            voucherCode: voucherCode || null,
            paymentMethod: paymentMethod || 'cod',
            items: orderItems,
            status: status || 'pending',
            createdBy
        }], { session });

        await session.commitTransaction();

        const populatedOrder = await Order.findById(newOrder[0]._id)
            .populate('items.productId', 'name pictureUrl')
            .populate('createdBy', 'fullName username');

        const subtotal = populatedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + populatedOrder.shippingFee;

        res.status(201).json({
            order_id: populatedOrder._id.toString(),
            customer_name: populatedOrder.customerName,
            phone_number: populatedOrder.phoneNumber,
            address: populatedOrder.address,
            note: populatedOrder.note,
            shipping_fee: populatedOrder.shippingFee,
            voucher_code: populatedOrder.voucherCode,
            payment_method: populatedOrder.paymentMethod || 'cod',
            status: populatedOrder.status,
            created_by: populatedOrder.createdBy ? {
                user_id: populatedOrder.createdBy._id.toString(),
                full_name: populatedOrder.createdBy.fullName,
                username: populatedOrder.createdBy.username
            } : null,
            items: populatedOrder.items.map(item => ({
                prod_id: item.productId._id.toString(),
                product_name: item.productName,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal,
            discount: 0,
            total,
            created_at: populatedOrder.createdAt
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        session.endSession();
    }
};

// Update an order
export const updateOrder = async (req, res) => {
    const { id } = req.params;
    const {
        customerName,
        customerPhone,
        customerAddress,
        customerNote,
        shippingFee,
        voucherCode,
        items,
        paymentMethod
    } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const order = await Order.findById(id).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Store original data for audit log
        req.originalData = order.toObject();

        // Only manage stock if order is confirmed (not pending or cancelled)
        if (order.status === 'confirmed') {
            // Restore stock from old items
            for (const oldItem of order.items) {
                const product = await Product.findById(oldItem.productId).session(session);
                if (product) {
                    product.stock += oldItem.quantity;
                    await product.save({ session });
                }
            }

            // Reduce stock for new items
            if (items && items.length > 0) {
                for (const item of items) {
                    const product = await Product.findById(item.productId).session(session);
                    if (!product) {
                        await session.abortTransaction();
                        return res.status(404).json({ message: `Product ${item.productId} not found` });
                    }
                    
                    if (product.stock < item.quantity) {
                        await session.abortTransaction();
                        return res.status(400).json({ 
                            message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
                        });
                    }

                    product.stock -= item.quantity;
                    await product.save({ session });
                }
            }
        }

        // Prepare new items array
        const orderItems = [];
        if (items && items.length > 0) {
            for (const item of items) {
                const product = await Product.findById(item.productId).session(session);
                orderItems.push({
                    productId: product._id,
                    productName: product.name,
                    quantity: item.quantity,
                    price: item.price
                });
            }
        }

        // Update order
        order.customerName = customerName;
        order.phoneNumber = customerPhone;
        order.address = customerAddress;
        order.note = customerNote || '';
        order.shippingFee = shippingFee || 0;
        order.voucherCode = voucherCode || null;
        order.paymentMethod = paymentMethod || order.paymentMethod || 'cod';
        order.items = orderItems;

        await order.save({ session });
        await session.commitTransaction();

        res.json({ message: 'Order updated successfully', orderId: order._id.toString(), newData: order });

    } catch (error) {
        await session.abortTransaction();
        console.error(`Update order ${id} error:`, error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        session.endSession();
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const order = await Order.findById(id).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Store original data for audit log
        req.originalData = { status: order.status };

        const oldStatus = order.status;

        // If confirming order, deduct stock
        if (status === 'confirmed' && oldStatus !== 'confirmed') {
            for (const item of order.items) {
                const product = await Product.findById(item.productId).session(session);
                if (product) {
                    if (product.stock < item.quantity) {
                        await session.abortTransaction();
                        return res.status(400).json({ 
                            message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
                        });
                    }
                    product.stock -= item.quantity;
                    await product.save({ session });
                }
            }
        }

        // If cancelling order from confirmed status, restore stock
        if (status === 'cancelled' && oldStatus === 'confirmed') {
            for (const item of order.items) {
                const product = await Product.findById(item.productId).session(session);
                if (product) {
                    product.stock += item.quantity;
                    await product.save({ session });
                }
            }
        }

        // Update order status
        order.status = status;
        await order.save({ session });

        await session.commitTransaction();
        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
        await session.abortTransaction();
        console.error(`Update order status ${id} error:`, error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        session.endSession();
    }
};

// Delete an order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const order = await Order.findById(id).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }

        // If order was confirmed, restore stock
        if (order.status === 'confirmed') {
            for (const item of order.items) {
                const product = await Product.findById(item.productId).session(session);
                if (product) {
                    product.stock += item.quantity;
                    await product.save({ session });
                }
            }
        }

        // Delete order
        await Order.findByIdAndDelete(id).session(session);
        
        await session.commitTransaction();
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error(`Delete order ${id} error:`, error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        session.endSession();
    }
};
