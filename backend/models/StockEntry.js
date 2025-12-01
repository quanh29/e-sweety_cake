import mongoose from 'mongoose';

const stockEntrySchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
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
    total: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'stock_entries'
});

// Indexes
stockEntrySchema.index({ createdBy: 1 });
stockEntrySchema.index({ createdAt: -1 });

const StockEntry = mongoose.model('StockEntry', stockEntrySchema);

export default StockEntry;
