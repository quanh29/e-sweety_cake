import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    pictureUrl: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'products'
});

// Indexes
productSchema.index({ name: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
