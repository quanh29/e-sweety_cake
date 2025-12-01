import pool from '../config/mysql.js';
import { v4 as uuidv4 } from 'uuid';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Get all vouchers
export const getAllVouchers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                v.voucher_code as code,
                v.is_absolute,
                v.amount as value,
                v.quantity,
                v.is_active,
                v.start_at as startDate,
                v.expired_at as endDate,
                COUNT(CASE WHEN o.status_id != 'CAN' THEN 1 END) as used_count
            FROM vouchers v
            LEFT JOIN orders o ON v.voucher_code = o.voucher_code
            GROUP BY v.voucher_code
            ORDER BY v.start_at DESC
        `);

        const vouchers = rows.map(voucher => ({
            id: voucher.code,
            code: voucher.code,
            type: voucher.is_absolute ? 'fixed' : 'percentage',
            value: parseFloat(voucher.value),
            quantity: parseInt(voucher.quantity),
            used: parseInt(voucher.used_count) || 0,
            isActive: voucher.is_active,
            startDate: voucher.startDate,
            endDate: voucher.endDate
        }));

        res.json(vouchers);
    } catch (error) {
        console.error('Get vouchers error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher' });
    }
};

// Get voucher by code
export const getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.params;
        
        const [rows] = await pool.query(`
            SELECT 
                v.voucher_code as code,
                v.is_absolute,
                v.amount as value,
                v.quantity,
                v.is_active,
                v.start_at as startDate,
                v.expired_at as endDate,
                COUNT(CASE WHEN o.status_id != 'CAN' THEN 1 END) as used_count
            FROM vouchers v
            LEFT JOIN orders o ON v.voucher_code = o.voucher_code
            WHERE v.voucher_code = ?
            GROUP BY v.voucher_code
        `, [code]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' });
        }

        const voucher = {
            id: rows[0].code,
            code: rows[0].code,
            type: rows[0].is_absolute ? 'fixed' : 'percentage',
            value: parseFloat(rows[0].value),
            quantity: parseInt(rows[0].quantity),
            used: parseInt(rows[0].used_count) || 0,
            isActive: rows[0].is_active,
            startDate: rows[0].startDate,
            endDate: rows[0].endDate
        };

        res.json(voucher);
    } catch (error) {
        console.error('Get voucher error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin voucher' });
    }
};

// Create new voucher
export const createVoucher = async (req, res) => {
    try {
        const { code, type, value, quantity, startDate, endDate } = req.body;

        // Validate required fields
        if (!code || !type || value === undefined || !quantity) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Check if voucher code already exists
        const [existing] = await pool.query(
            'SELECT voucher_code FROM vouchers WHERE voucher_code = ?',
            [code.toUpperCase()]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Mã voucher đã tồn tại' });
        }

        const isAbsolute = type === 'fixed';
        
        // Convert dates to MySQL TIMESTAMP format (YYYY-MM-DD HH:MM:SS)
        const formatMySQLDate = (dateInput) => {
            if (!dateInput) return null;
            const date = new Date(dateInput);
            return date.toISOString().slice(0, 19).replace('T', ' ');
        };

        const startAtFormatted = startDate ? formatMySQLDate(startDate) : formatMySQLDate(new Date());
        const expiredAtFormatted = endDate ? formatMySQLDate(endDate) : null;

        // Validate dates are not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate) {
            const startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0);
            if (startDateObj < today) {
                return res.status(400).json({ message: 'Ngày bắt đầu không được là ngày trong quá khứ' });
            }
        }
        
        if (endDate) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(0, 0, 0, 0);
            if (endDateObj < today) {
                return res.status(400).json({ message: 'Ngày kết thúc không được là ngày trong quá khứ' });
            }
            // Also check that end date is not before start date
            const startDateObj = new Date(startDate || new Date());
            startDateObj.setHours(0, 0, 0, 0);
            if (endDateObj < startDateObj) {
                return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
            }
        }
        
        await pool.query(`
            INSERT INTO vouchers (
                voucher_code,
                is_absolute,
                amount,
                quantity,
                is_active,
                start_at,
                expired_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            code.toUpperCase(),
            isAbsolute,
            value,
            quantity,
            true,
            startAtFormatted,
            expiredAtFormatted
        ]);

        const newVoucher = {
            id: code.toUpperCase(),
            code: code.toUpperCase(),
            type,
            value: parseFloat(value),
            quantity: parseInt(quantity),
            used: 0,
            isActive: true,
            startDate: startAtFormatted,
            endDate: expiredAtFormatted
        };

        res.status(201).json(newVoucher);
    } catch (error) {
        console.error('Create voucher error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo voucher' });
    }
};

// Toggle voucher active status
export const toggleVoucherStatus = async (req, res) => {
    try {
        const { code } = req.params;

        // Check if voucher exists
        const [existing] = await pool.query(
            'SELECT voucher_code, is_active FROM vouchers WHERE voucher_code = ?',
            [code]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' });
        }

        const newStatus = !existing[0].is_active;

        await pool.query(
            'UPDATE vouchers SET is_active = ? WHERE voucher_code = ?',
            [newStatus, code]
        );

        res.json({ 
            message: newStatus ? 'Kích hoạt voucher thành công' : 'Vô hiệu hóa voucher thành công',
            isActive: newStatus
        });
    } catch (error) {
        console.error('Toggle voucher status error:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái voucher' });
    }
};

// Validate voucher (for applying to orders)
export const validateVoucher = async (req, res) => {
    try {
        const { code } = req.params;

        const [rows] = await pool.query(`
            SELECT 
                voucher_code as code,
                is_absolute,
                amount as value,
                quantity,
                is_active,
                expired_at as endDate
            FROM vouchers
            WHERE voucher_code = ?
        `, [code.toUpperCase()]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                valid: false, 
                message: 'Mã voucher không tồn tại' 
            });
        }

        const voucher = rows[0];

        // Check if active
        if (!voucher.is_active) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Mã voucher đã bị vô hiệu hóa' 
            });
        }

        // Check if expired
        if (voucher.endDate && new Date(voucher.endDate) < new Date()) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Mã voucher đã hết hạn' 
            });
        }

        // Check if quantity available
        if (voucher.quantity <= 0) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Mã voucher đã hết lượt sử dụng' 
            });
        }

        res.json({
            code: voucher.code,
            type: voucher.is_absolute ? 'fixed' : 'percentage',
            value: parseFloat(voucher.value),
            minPurchase: 0,
            voucherName: `Giảm ${voucher.is_absolute ? formatCurrency(voucher.value) : voucher.value + '%'}`
        });
    } catch (error) {
        console.error('Validate voucher error:', error);
        res.status(500).json({ 
            valid: false, 
            message: 'Lỗi khi kiểm tra voucher' 
        });
    }
};
