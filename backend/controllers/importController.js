import pool from '../config/mysql.js';
import { v4 as uuidv4 } from 'uuid';

// Get all stock entries
export const getAllImports = async (req, res) => {
    try {
        const [entries] = await pool.query(`
            SELECT 
                se.entry_id,
                se.created_by,
                se.created_at,
                se.shipping_fee,
                u.full_name as creator_name
            FROM stock_entries se
            LEFT JOIN users u ON se.created_by = u.user_id
            ORDER BY se.created_at DESC
        `);

        const importsWithDetails = await Promise.all(entries.map(async (entry) => {
            const [items] = await pool.query(`
                SELECT 
                    ed.prod_id,
                    ed.quantity,
                    ed.price,
                    p.prod_name,
                    p.picture_url
                FROM entry_details ed
                LEFT JOIN products p ON ed.prod_id = p.prod_id
                WHERE ed.entry_id = ?
            `, [entry.entry_id]);

            const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const total = subtotal + (entry.shipping_fee || 0);

            return {
                id: entry.entry_id,
                createdBy: entry.created_by,
                creatorName: entry.creator_name,
                shippingFee: parseFloat(entry.shipping_fee || 0),
                subtotal: parseFloat(subtotal),
                total: parseFloat(total),
                createdAt: entry.created_at,
                items: items.map(item => ({
                    productId: item.prod_id,
                    productName: item.prod_name,
                    quantity: parseFloat(item.quantity),
                    price: parseFloat(item.price),
                    subtotal: parseFloat(item.quantity * item.price)
                }))
            };
        }));

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

        const [entries] = await pool.query(`
            SELECT 
                se.entry_id,
                se.created_by,
                se.created_at,
                se.shipping_fee,
                u.full_name as creator_name
            FROM stock_entries se
            LEFT JOIN users u ON se.created_by = u.user_id
            WHERE se.entry_id = ?
        `, [id]);

        if (entries.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn nhập hàng' });
        }

        const entry = entries[0];

        const [items] = await pool.query(`
            SELECT 
                ed.prod_id,
                ed.quantity,
                ed.price,
                p.prod_name,
                p.picture_url
            FROM entry_details ed
            LEFT JOIN products p ON ed.prod_id = p.prod_id
            WHERE ed.entry_id = ?
        `, [id]);

        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const total = subtotal + (entry.shipping_fee || 0);

        const importData = {
            id: entry.entry_id,
            createdBy: entry.created_by,
            creatorName: entry.creator_name,
            shippingFee: parseFloat(entry.shipping_fee || 0),
            subtotal: parseFloat(subtotal),
            total: parseFloat(total),
            createdAt: entry.created_at,
            items: items.map(item => ({
                productId: item.prod_id,
                productName: item.prod_name,
                quantity: parseFloat(item.quantity),
                price: parseFloat(item.price),
                subtotal: parseFloat(item.quantity * item.price)
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
    const connection = await pool.getConnection();
    try {
        const { items, shippingFee } = req.body;
        const userId = req.user.id; // from authenticateJWT middleware

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Đơn nhập hàng phải có ít nhất một sản phẩm' });
        }

        await connection.beginTransaction();

        const entryId = uuidv4();

        // Insert stock entry
        await connection.query(`
            INSERT INTO stock_entries (
                entry_id,
                created_by,
                shipping_fee
            ) VALUES (?, ?, ?)
        `, [entryId, userId, shippingFee || 0]);

        // Insert entry details and update product stock
        let subtotal = 0;
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.price) {
                await connection.rollback();
                return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' });
            }

            // Insert entry detail
            await connection.query(`
                INSERT INTO entry_details (
                    entry_id,
                    prod_id,
                    quantity,
                    price
                ) VALUES (?, ?, ?, ?)
            `, [entryId, item.productId, item.quantity, item.price]);

            // Update product stock
            await connection.query(`
                UPDATE products 
                SET stock = stock + ? 
                WHERE prod_id = ?
            `, [item.quantity, item.productId]);

            subtotal += item.quantity * item.price;
        }

        await connection.commit();

        const total = subtotal + (shippingFee || 0);

        // Fetch created import with details
        const [entries] = await pool.query(`
            SELECT 
                se.entry_id,
                se.created_by,
                se.created_at,
                se.shipping_fee,
                u.full_name as creator_name
            FROM stock_entries se
            LEFT JOIN users u ON se.created_by = u.user_id
            WHERE se.entry_id = ?
        `, [entryId]);

        const [itemsResult] = await pool.query(`
            SELECT 
                ed.prod_id,
                ed.quantity,
                ed.price,
                p.prod_name
            FROM entry_details ed
            LEFT JOIN products p ON ed.prod_id = p.prod_id
            WHERE ed.entry_id = ?
        `, [entryId]);

        const newImport = {
            id: entryId,
            createdBy: userId,
            creatorName: entries[0].creator_name,
            shippingFee: parseFloat(shippingFee || 0),
            subtotal: parseFloat(subtotal),
            total: parseFloat(total),
            createdAt: entries[0].created_at,
            items: itemsResult.map(item => ({
                productId: item.prod_id,
                productName: item.prod_name,
                quantity: parseFloat(item.quantity),
                price: parseFloat(item.price),
                subtotal: parseFloat(item.quantity * item.price)
            }))
        };

        res.status(201).json(newImport);
    } catch (error) {
        await connection.rollback();
        console.error('Create import error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo đơn nhập hàng' });
    } finally {
        connection.release();
    }
};

// Delete stock entry
export const deleteImport = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;

        // Check if entry exists
        const [entries] = await connection.query(
            'SELECT entry_id FROM stock_entries WHERE entry_id = ?',
            [id]
        );

        if (entries.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn nhập hàng' });
        }

        await connection.beginTransaction();

        // Get entry details to reverse stock updates
        const [items] = await connection.query(
            'SELECT prod_id, quantity FROM entry_details WHERE entry_id = ?',
            [id]
        );

        // Reverse stock updates
        for (const item of items) {
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE prod_id = ?',
                [item.quantity, item.prod_id]
            );
        }

        // Delete entry details
        await connection.query('DELETE FROM entry_details WHERE entry_id = ?', [id]);

        // Delete stock entry
        await connection.query('DELETE FROM stock_entries WHERE entry_id = ?', [id]);

        await connection.commit();

        res.json({ message: 'Xóa đơn nhập hàng thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Delete import error:', error);
        res.status(500).json({ message: 'Lỗi khi xóa đơn nhập hàng' });
    } finally {
        connection.release();
    }
};

// Update stock entry
export const updateImport = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { items, shippingFee } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Đơn nhập hàng phải có ít nhất một sản phẩm' });
        }

        // Check if entry exists
        const [entries] = await connection.query(
            'SELECT entry_id FROM stock_entries WHERE entry_id = ?',
            [id]
        );

        if (entries.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn nhập hàng' });
        }

        await connection.beginTransaction();

        // Get old entry details to reverse stock updates
        const [oldItems] = await connection.query(
            'SELECT prod_id, quantity FROM entry_details WHERE entry_id = ?',
            [id]
        );

        // Reverse old stock updates
        for (const item of oldItems) {
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE prod_id = ?',
                [item.quantity, item.prod_id]
            );
        }

        // Delete old entry details
        await connection.query('DELETE FROM entry_details WHERE entry_id = ?', [id]);

        // Update stock entry
        await connection.query(
            'UPDATE stock_entries SET shipping_fee = ? WHERE entry_id = ?',
            [shippingFee || 0, id]
        );

        // Insert new entry details and update product stock
        let subtotal = 0;
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.price) {
                await connection.rollback();
                return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' });
            }

            // Insert entry detail
            await connection.query(`
                INSERT INTO entry_details (
                    entry_id,
                    prod_id,
                    quantity,
                    price
                ) VALUES (?, ?, ?, ?)
            `, [id, item.productId, item.quantity, item.price]);

            // Update product stock with new quantity
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE prod_id = ?',
                [item.quantity, item.productId]
            );

            subtotal += item.quantity * item.price;
        }

        await connection.commit();

        const total = subtotal + (shippingFee || 0);

        // Fetch updated import with details
        const [updatedEntries] = await pool.query(`
            SELECT 
                se.entry_id,
                se.created_by,
                se.created_at,
                se.shipping_fee,
                u.full_name as creator_name
            FROM stock_entries se
            LEFT JOIN users u ON se.created_by = u.user_id
            WHERE se.entry_id = ?
        `, [id]);

        const [itemsResult] = await pool.query(`
            SELECT 
                ed.prod_id,
                ed.quantity,
                ed.price,
                p.prod_name
            FROM entry_details ed
            LEFT JOIN products p ON ed.prod_id = p.prod_id
            WHERE ed.entry_id = ?
        `, [id]);

        const updatedImport = {
            id: id,
            createdBy: updatedEntries[0].created_by,
            creatorName: updatedEntries[0].creator_name,
            shippingFee: parseFloat(shippingFee || 0),
            subtotal: parseFloat(subtotal),
            total: parseFloat(total),
            createdAt: updatedEntries[0].created_at,
            items: itemsResult.map(item => ({
                productId: item.prod_id,
                productName: item.prod_name,
                quantity: parseFloat(item.quantity),
                price: parseFloat(item.price),
                subtotal: parseFloat(item.quantity * item.price)
            }))
        };

        res.json(updatedImport);
    } catch (error) {
        await connection.rollback();
        console.error('Update import error:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật đơn nhập hàng' });
    } finally {
        connection.release();
    }
};
