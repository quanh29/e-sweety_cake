import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    voucherCode: {
        type: String,
        default: null
    },
    note: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'],
        default: 'pending'
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    subtotal: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'orders'
});

// Indexes
orderSchema.index({ status: 1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order status
orderSchema.virtual('statusName').get(function() {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipped': 'Đang giao',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[this.status] || this.status;
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
