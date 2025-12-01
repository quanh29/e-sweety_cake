import Product from '../models/Product.js';

export const getAllProducts = async () => {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return products.map(p => ({
        prod_id: p._id.toString(),
        prod_name: p.name,
        prod_description: p.description,
        price: p.price,
        stock: p.stock,
        picture_url: p.pictureUrl
    }));
};

export const getProductById = async (id) => {
    const product = await Product.findById(id).lean();
    if (!product) return null;
    
    return {
        prod_id: product._id.toString(),
        prod_name: product.name,
        prod_description: product.description,
        price: product.price,
        stock: product.stock,
        picture_url: product.pictureUrl
    };
};

export const createProduct = async (product) => {
    const { name, description, price, stock, imageUrl } = product;
    const newProduct = await Product.create({
        name,
        description,
        price,
        stock,
        pictureUrl: imageUrl
    });
    
    return {
        prod_id: newProduct._id.toString(),
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        stock: newProduct.stock,
        imageUrl: newProduct.pictureUrl
    };
};

export const updateProduct = async (id, product) => {
    const { name, description, price, stock, imageUrl } = product;
    
    const updateData = {
        name,
        description,
        price,
        stock
    };
    
    if (imageUrl) {
        updateData.pictureUrl = imageUrl;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );
    
    return updatedProduct !== null;
};

export const deleteProduct = async (id) => {
    const result = await Product.findByIdAndDelete(id);
    return result !== null;
};
