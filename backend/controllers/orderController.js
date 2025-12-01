import pool from '../config/mysql.js';
import { v4 as uuidv4 } from 'uuid';

const statusToId = {
    pending: 'PEN',
    confirmed: 'CON',
    shipped: 'SHP',
    completed: 'COM', // Assuming COM for completed based on your previous UI
    cancelled: 'CAN'
};

const idToStatus = {
    PEN: 'pending',
    CON: 'confirmed',
    SHP: 'shipped',
    COM: 'completed',
    CAN: 'cancelled'
};

// Public controller for creating orders (no authentication required)
export const createPublicOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            customerName, customerPhone, customerAddress, note,
            shippingFee, voucherCode, items
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const orderId = uuidv4();
        const statusId = 'PEN'; // Always set to pending for public orders
        const finalVoucherCode = voucherCode || null;

        await connection.beginTransaction();

        // Create order without created_by since it's a public order
        await connection.query(
            `INSERT INTO orders (order_id, customer_name, phone_number, address, note, shipping_fee, voucher_code, status_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [orderId, customerName, customerPhone, customerAddress, note, shippingFee, finalVoucherCode, statusId]
        );

        for (const item of items) {
            await connection.query(
                `INSERT INTO order_details (order_id, prod_id, quantity, price) VALUES (?, ?, ?, ?)`,
                [orderId, item.productId, item.quantity, item.price]
            );
            
            // Reduce product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE prod_id = ?',
                [item.quantity, item.productId]
            );
        }

        await connection.commit();

        // Fetch the newly created order with all details
        const [orders] = await connection.query(`
            SELECT 
                o.order_id, o.customer_name, o.phone_number, o.address, o.shipping_fee, o.voucher_code, o.note, o.created_at, o.status_id,
                (SELECT SUM(od.price * od.quantity) FROM order_details od WHERE od.order_id = o.order_id) as subtotal
            FROM orders o
            WHERE o.order_id = ?
        `, [orderId]);

        const [details] = await connection.query('SELECT prod_id, quantity, price FROM order_details WHERE order_id = ?', [orderId]);
        
        const newOrder = {
            ...orders[0],
            status: idToStatus[orders[0].status_id] || 'pending',
            items: details,
            total: parseFloat(orders[0].subtotal || 0) + parseFloat(orders[0].shipping_fee || 0)
        };

        res.status(201).json(newOrder);

    } catch (error) {
        await connection.rollback();
        console.error('Create public order error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        connection.release();
    }
};


// Get all orders
export const getOrders = async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT 
                o.order_id, o.customer_name, o.phone_number, o.address, o.shipping_fee, o.voucher_code, o.note, o.created_at, o.status_id,
                (SELECT SUM(od.price * od.quantity) FROM order_details od WHERE od.order_id = o.order_id) as subtotal
            FROM orders o
            ORDER BY o.created_at DESC
        `);

        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const [details] = await pool.query('SELECT prod_id, quantity, price FROM order_details WHERE order_id = ?', [order.order_id]);
            return {
                ...order,
                status: idToStatus[order.status_id] || 'pending',
                items: details,
                total: parseFloat(order.subtotal || 0) + parseFloat(order.shipping_fee || 0) // Simplified total
            };
        }));

        res.json(ordersWithDetails);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            customerName, customerPhone, customerAddress, note,
            shippingFee, voucherCode, items, status
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const orderId = uuidv4();
        const statusId = statusToId[status] || 'PEN';
        const createdBy = req.user.id;

        const finalVoucherCode = voucherCode || null;

        await connection.beginTransaction();

        await connection.query(
            `INSERT INTO orders (order_id, customer_name, phone_number, address, note, shipping_fee, voucher_code, status_id, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [orderId, customerName, customerPhone, customerAddress, note, shippingFee, finalVoucherCode, statusId, createdBy]
        );

        for (const item of items) {
            await connection.query(
                `INSERT INTO order_details (order_id, prod_id, quantity, price) VALUES (?, ?, ?, ?)`,
                [orderId, item.productId, item.quantity, item.price]
            );
            
            // Reduce product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE prod_id = ?',
                [item.quantity, item.productId]
            );
        }

        await connection.commit();

        // Fetch the newly created order with all details
        const [orders] = await connection.query(`
            SELECT 
                o.order_id, o.customer_name, o.phone_number, o.address, o.shipping_fee, o.voucher_code, o.note, o.created_at, o.status_id,
                (SELECT SUM(od.price * od.quantity) FROM order_details od WHERE od.order_id = o.order_id) as subtotal
            FROM orders o
            WHERE o.order_id = ?
        `, [orderId]);

        const [details] = await connection.query('SELECT prod_id, quantity, price FROM order_details WHERE order_id = ?', [orderId]);
        
        const newOrder = {
            ...orders[0],
            status: idToStatus[orders[0].status_id] || 'pending',
            items: details,
            total: parseFloat(orders[0].subtotal || 0) + parseFloat(orders[0].shipping_fee || 0)
        };

        res.status(201).json(newOrder);

    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};

// Update an order
export const updateOrder = async (req, res) => {
    const { id } = req.params;
    const {
        customerName,
        customerPhone,
        customerAddress,
        note,
        shippingFee,
        voucherCode,
        items
    } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if order exists and get its status
        const [orders] = await connection.query(
            'SELECT status_id FROM orders WHERE order_id = ?',
            [id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderStatus = idToStatus[orders[0].status_id];

        // Only update stock if order is not cancelled
        if (orderStatus !== 'cancelled') {
            // Get old order details to restore stock
            const [oldItems] = await connection.query(
                'SELECT prod_id, quantity FROM order_details WHERE order_id = ?',
                [id]
            );

            // Restore stock from old items
            for (const oldItem of oldItems) {
                await connection.query(
                    'UPDATE products SET stock = stock + ? WHERE prod_id = ?',
                    [oldItem.quantity, oldItem.prod_id]
                );
            }
        }

        // 1. Update the main order table
        const finalVoucherCode = voucherCode || null;

        await connection.query(
            `UPDATE orders SET 
                customer_name = ?, 
                phone_number = ?, 
                address = ?, 
                note = ?, 
                shipping_fee = ?, 
                voucher_code = ?
             WHERE order_id = ?`,
            [customerName, customerPhone, customerAddress, note, shippingFee, finalVoucherCode, id]
        );

        // 2. Delete old order details
        await connection.query('DELETE FROM order_details WHERE order_id = ?', [id]);

        // 3. Insert new order details and reduce stock
        if (items && items.length > 0) {
            for (const item of items) {
                await connection.query(
                    `INSERT INTO order_details (order_id, prod_id, quantity, price) VALUES (?, ?, ?, ?)`,
                    [id, item.productId, item.quantity, item.price]
                );

                // Reduce stock for new items (only if order is not cancelled)
                if (orderStatus !== 'cancelled') {
                    await connection.query(
                        'UPDATE products SET stock = stock - ? WHERE prod_id = ?',
                        [item.quantity, item.productId]
                    );
                }
            }
        }

        await connection.commit();

        // Fetch and return the updated order data
        const [rows] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [id]);
        const updatedOrder = rows[0]; // Simplified, for a full object you might call getOrders logic
        
        res.json({ message: 'Order updated successfully', order: updatedOrder });

    } catch (error) {
        await connection.rollback();
        console.error(`Update order ${id} error:`, error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !statusToId[status]) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get current order status
        const [currentOrder] = await connection.query(
            'SELECT status_id FROM orders WHERE order_id = ?',
            [id]
        );

        if (currentOrder.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        const oldStatus = idToStatus[currentOrder[0].status_id];
        const statusId = statusToId[status];

        // If cancelling order, restore stock
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            const [orderItems] = await connection.query(
                'SELECT prod_id, quantity FROM order_details WHERE order_id = ?',
                [id]
            );

            for (const item of orderItems) {
                await connection.query(
                    'UPDATE products SET stock = stock + ? WHERE prod_id = ?',
                    [item.quantity, item.prod_id]
                );
            }
        }

        // If confirming order, add to sales table
        if (status === 'confirmed' && oldStatus !== 'confirmed') {
            const userId = req.user.id;
            await connection.query(
                'INSERT INTO sales (order_id, user_id) VALUES (?, ?)',
                [id, userId]
            );
        }

        // Update order status
        await connection.query(
            'UPDATE orders SET status_id = ? WHERE order_id = ?',
            [statusId, id]
        );

        await connection.commit();
        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
        await connection.rollback();
        console.error(`Update order status ${id} error:`, error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};

// Delete an order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get order status before deleting
        const [orders] = await connection.query(
            'SELECT status_id FROM orders WHERE order_id = ?',
            [id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderStatus = idToStatus[orders[0].status_id];

        // If order is not cancelled, restore stock
        if (orderStatus !== 'cancelled') {
            const [orderItems] = await connection.query(
                'SELECT prod_id, quantity FROM order_details WHERE order_id = ?',
                [id]
            );

            for (const item of orderItems) {
                await connection.query(
                    'UPDATE products SET stock = stock + ? WHERE prod_id = ?',
                    [item.quantity, item.prod_id]
                );
            }
        }

        // Delete from sales table (CASCADE will handle this, but explicit is clearer)
        await connection.query('DELETE FROM sales WHERE order_id = ?', [id]);
        
        // Delete order details and order
        await connection.query('DELETE FROM order_details WHERE order_id = ?', [id]);
        await connection.query('DELETE FROM orders WHERE order_id = ?', [id]);
        
        await connection.commit();

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(`Delete order ${id} error:`, error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};
