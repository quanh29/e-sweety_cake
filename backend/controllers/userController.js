import pool from '../config/mysql.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                user_id,
                full_name,
                username,
                is_actived,
                is_admin
            FROM users
            ORDER BY full_name ASC
        `);

        const users = rows.map(user => ({
            id: user.user_id,
            fullname: user.full_name,
            username: user.username,
            role: user.is_admin ? 'admin' : 'user',
            status: user.is_actived ? 'active' : 'inactive',
            isAdmin: user.is_admin,
            isActive: user.is_actived
        }));

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT 
                user_id,
                full_name,
                username,
                is_actived,
                is_admin
            FROM users
            WHERE user_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const user = {
            id: rows[0].user_id,
            fullname: rows[0].full_name,
            username: rows[0].username,
            role: rows[0].is_admin ? 'admin' : 'user',
            status: rows[0].is_actived ? 'active' : 'inactive',
            isAdmin: rows[0].is_admin,
            isActive: rows[0].is_actived
        };

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { fullname, username, password, role } = req.body;

        // Validate required fields
        if (!fullname || !username || !password) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Check if username already exists
        const [existing] = await pool.query(
            'SELECT user_id FROM users WHERE username = ?',
            [username.toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username đã tồn tại' });
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = uuidv4();
        const isAdmin = role === 'admin';

        await pool.query(`
            INSERT INTO users (
                user_id,
                full_name,
                username,
                hashed_password,
                salt,
                is_actived,
                is_admin
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            fullname,
            username.toLowerCase(),
            hashedPassword,
            salt,
            true,
            isAdmin
        ]);

        const newUser = {
            id: userId,
            fullname,
            username: username.toLowerCase(),
            role: role || 'user',
            status: 'active',
            isAdmin,
            isActive: true
        };

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo người dùng' });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, password, role, status } = req.body;

        // Check if user exists
        const [existing] = await pool.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Prepare update query
        let updateQuery = 'UPDATE users SET ';
        const updateParams = [];

        if (fullname !== undefined && fullname !== null) {
            updateQuery += 'full_name = ?, ';
            updateParams.push(fullname);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery += 'hashed_password = ?, salt = ?, ';
            updateParams.push(hashedPassword, salt);
        }

        if (role !== undefined && role !== null) {
            const isAdmin = role === 'admin';
            updateQuery += 'is_admin = ?, ';
            updateParams.push(isAdmin);
        }

        if (status !== undefined && status !== null) {
            const isActive = status === 'active';
            updateQuery += 'is_actived = ?, ';
            updateParams.push(isActive);
        }

        // Check if there are any fields to update
        if (updateParams.length === 0) {
            return res.status(400).json({ message: 'Không có thông tin để cập nhật' });
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE user_id = ?';
        updateParams.push(id);

        console.log('[updateUser] Query:', updateQuery, 'Params:', updateParams);
        await pool.query(updateQuery, updateParams);

        // Fetch updated user
        const [rows] = await pool.query(`
            SELECT 
                user_id,
                full_name,
                username,
                is_actived,
                is_admin
            FROM users
            WHERE user_id = ?
        `, [id]);

        const updatedUser = {
            id: rows[0].user_id,
            fullname: rows[0].full_name,
            username: rows[0].username,
            role: rows[0].is_admin ? 'admin' : 'user',
            status: rows[0].is_actived ? 'active' : 'inactive',
            isAdmin: rows[0].is_admin,
            isActive: rows[0].is_actived
        };

        res.json(updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists and is admin
        const [user] = await pool.query(
            'SELECT is_admin FROM users WHERE user_id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        if (user[0].is_admin) {
            return res.status(400).json({ 
                message: 'Không thể xóa tài khoản admin' 
            });
        }

        // Check if user has created orders
        const [orders] = await pool.query(
            'SELECT order_id FROM orders WHERE created_by = ? LIMIT 1',
            [id]
        );

        if (orders.length > 0) {
            return res.status(400).json({ 
                message: 'Không thể xóa người dùng đã tạo đơn hàng. Hãy vô hiệu hóa tài khoản thay vì xóa.' 
            });
        }

        const [result] = await pool.query(
            'DELETE FROM users WHERE user_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
    }
};

// Toggle user active status (ban/activate)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists and is admin
        const [user] = await pool.query(
            'SELECT is_admin, is_actived FROM users WHERE user_id = ?',
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        if (user[0].is_admin) {
            return res.status(400).json({ 
                message: 'Không thể vô hiệu hóa tài khoản admin' 
            });
        }

        const newStatus = !user[0].is_actived;

        await pool.query(
            'UPDATE users SET is_actived = ? WHERE user_id = ?',
            [newStatus, id]
        );

        res.json({ 
            message: newStatus ? 'Kích hoạt người dùng thành công' : 'Vô hiệu hóa người dùng thành công',
            status: newStatus ? 'active' : 'inactive'
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái người dùng' });
    }
};
