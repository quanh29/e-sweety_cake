import pool from '../config/mysql.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllProducts = async () => {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
};

export const getProductById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE prod_id = ?', [id]);
    return rows[0];
};

export const createProduct = async (product) => {
    const { name, description, price, stock, imageUrl } = product;
    const prod_id = uuidv4();
    const [result] = await pool.query(
        'INSERT INTO products (prod_id, prod_name, prod_description, price, stock, picture_url) VALUES (?, ?, ?, ?, ?, ?)',
        [prod_id, name, description, price, stock, imageUrl]
    );
    return { prod_id, ...product };
};

export const updateProduct = async (id, product) => {
    const { name, description, price, stock, imageUrl } = product;
    let query = 'UPDATE products SET prod_name = ?, prod_description = ?, price = ?, stock = ?';
    const params = [name, description, price, stock];

    if (imageUrl) {
        query += ', picture_url = ?';
        params.push(imageUrl);
    }

    query += ' WHERE prod_id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    return result.affectedRows > 0;
};

export const deleteProduct = async (id) => {
    const [result] = await pool.query('DELETE FROM products WHERE prod_id = ?', [id]);
    return result.affectedRows > 0;
};
