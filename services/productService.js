const db = require('../models/db');

const productService = {
    getProducts: (categoryName, productName) => {
        let query = 'SELECT * FROM products';
        let queryParams = [];

        if (categoryName && productName) {
            query += ' WHERE category = ? AND name LIKE ?';
            queryParams = [categoryName, `%${productName}%`];
        } else if (categoryName) {
            query += ' WHERE category = ?';
            queryParams = [categoryName];
        } else if (productName) {
            query += ' WHERE name LIKE ?';
            queryParams = [`%${productName}%`];
        }

        return new Promise((resolve, reject) => {
            db.query(query, queryParams, (err, results) => {
                if (err) return reject({ error: 'Failed to fetch products', details: err });
                resolve(results);
            });
        });
    },

    getProductById: (id) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
                if (err) return reject({ error: 'Error fetching product', details: err });
                if (results.length === 0) return reject({ error: 'Product not found' });
                resolve(results[0]);
            });
        });
    },

    addProduct: (productData) => {
        const { id, name, imgUrl, description, price, category, sizes, inStock, colors } = productData;
        const sizesArray = Array.isArray(sizes) ? JSON.stringify(sizes) : null;
        const colorsArray = Array.isArray(colors) ? JSON.stringify(colors) : null;

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO products (id, name, imgUrl, description, price, category, sizes, inStock, colors)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(query, [id, name, imgUrl, description, price, category, sizesArray, inStock, colorsArray], (err) => {
                if (err) return reject({ error: 'Error inserting product', details: err });
                resolve({ message: 'Product added successfully', id });
            });
        });
    },

    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM products WHERE id = ?';
            db.query(query, [id], (err, result) => {
                if (err) return reject({ error: 'Error deleting product', details: err });
                if (result.affectedRows === 0) return reject({ error: 'Product not found' });
                resolve({ message: 'Product deleted successfully', id });
            });
        });
    },

    updateProduct: (id, productData) => {
        const { name, description, price, inStock } = productData;

        return new Promise((resolve, reject) => {
            const query = `
                UPDATE products SET name = ?, description = ?, price = ?, inStock = ?
                WHERE id = ?
            `;
            db.query(query, [name, description, price, inStock, id], (err, result) => {
                if (err) return reject({ error: 'Error updating product', details: err });
                if (result.affectedRows === 0) return reject({ error: 'Product not found' });
                resolve({ message: 'Product updated successfully', id });
            });
        });
    }
};

module.exports = productService;
