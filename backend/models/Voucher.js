import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    isAbsolute: {
        type: Boolean,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    startAt: {
        type: Date,
        required: true
    },
    expiredAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'vouchers'
});

// Index code đã được tạo tự động bởi unique: true
// Thêm index cho isActive để tối ưu queries
voucherSchema.index({ isActive: 1 });

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
