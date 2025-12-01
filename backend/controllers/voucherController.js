import Voucher from '../models/Voucher.js';
import Order from '../models/Order.js';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Get all vouchers
export const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ startAt: -1 }).lean();

        const vouchersWithUsage = await Promise.all(vouchers.map(async (voucher) => {
            const usedCount = await Order.countDocuments({
                voucherCode: voucher.code,
                status: { $ne: 'cancelled' }
            });

            return {
                id: voucher.code,
                code: voucher.code,
                type: voucher.isAbsolute ? 'fixed' : 'percentage',
                value: parseFloat(voucher.amount),
                quantity: parseInt(voucher.quantity),
                used: usedCount,
                isActive: voucher.isActive,
                startDate: voucher.startAt,
                endDate: voucher.expiredAt
            };
        }));

        res.json(vouchersWithUsage);
    } catch (error) {
        console.error('Get vouchers error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher' });
    }
};

// Get voucher by code
export const getVoucherByCode = async (req, res) => {
    try {
        const { code } = req.params;
        
        const voucher = await Voucher.findOne({ code: code.toUpperCase() }).lean();

        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' });
        }

        const usedCount = await Order.countDocuments({
            voucherCode: voucher.code,
            status: { $ne: 'cancelled' }
        });

        res.json({
            id: voucher.code,
            code: voucher.code,
            type: voucher.isAbsolute ? 'fixed' : 'percentage',
            value: parseFloat(voucher.amount),
            quantity: parseInt(voucher.quantity),
            used: usedCount,
            isActive: voucher.isActive,
            startDate: voucher.startAt,
            endDate: voucher.expiredAt
        });
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
        const existing = await Voucher.findOne({ code: code.toUpperCase() });

        if (existing) {
            return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
        }

        const isAbsolute = type === 'fixed';
        
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
            const startDateObj = new Date(startDate || new Date());
            startDateObj.setHours(0, 0, 0, 0);
            if (endDateObj < startDateObj) {
                return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
            }
        }
        
        const newVoucher = await Voucher.create({
            code: code.toUpperCase(),
            isAbsolute,
            amount: value,
            quantity,
            isActive: true,
            startAt: startDate ? new Date(startDate) : new Date(),
            expiredAt: endDate ? new Date(endDate) : null
        });

        res.status(201).json({
            id: newVoucher.code,
            code: newVoucher.code,
            type,
            value: parseFloat(value),
            quantity: parseInt(quantity),
            used: 0,
            isActive: true,
            startDate: newVoucher.startAt,
            endDate: newVoucher.expiredAt
        });
    } catch (error) {
        console.error('Create voucher error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo voucher' });
    }
};

// Toggle voucher active status
export const toggleVoucherStatus = async (req, res) => {
    try {
        const { code } = req.params;

        const voucher = await Voucher.findOne({ code });
        if (!voucher) {
            return res.status(404).json({ message: 'Không tìm thấy voucher' });
        }

        const newStatus = !voucher.isActive;
        voucher.isActive = newStatus;
        await voucher.save();

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

        const voucher = await Voucher.findOne({ code: code.toUpperCase() }).lean();

        if (!voucher) {
            return res.status(404).json({ 
                valid: false, 
                message: 'Mã voucher không tồn tại' 
            });
        }

        // Check if active
        if (!voucher.isActive) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Mã voucher đã bị vô hiệu hóa' 
            });
        }
        // Check if started
        if (voucher.startAt && new Date(voucher.startAt) > new Date()) {
            return res.status(400).json({
                valid: false,
                message: 'Mã voucher chưa bắt đầu có hiệu lực'
            });
        }

        // Check if expired
        if (voucher.expiredAt && new Date(voucher.expiredAt) < new Date()) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Mã voucher đã hết hạn' 
            });
        }

        // Check quantity available
        const usedCount = await Order.countDocuments({
            voucherCode: voucher.code,
            status: { $ne: 'cancelled' }
        });

        if (usedCount >= voucher.quantity) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Mã voucher đã hết lượt sử dụng' 
            });
        }

        res.json({
            code: voucher.code,
            type: voucher.isAbsolute ? 'fixed' : 'percentage',
            value: parseFloat(voucher.amount),
            minPurchase: 0,
            voucherName: `Giảm ${voucher.isAbsolute ? formatCurrency(voucher.amount) : voucher.amount + '%'}`
        });
    } catch (error) {
        console.error('Validate voucher error:', error);
        res.status(500).json({ 
            valid: false, 
            message: 'Lỗi khi kiểm tra voucher' 
        });
    }
};
