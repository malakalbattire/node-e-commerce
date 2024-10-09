const db = require('../models/db');

const categoryService = {
    addCategory: (categoryData) => {
        const { id, name, imgUrl } = categoryData;
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO categories (id, name, imgUrl) VALUES (?, ?, ?)';
            const values = [id, name, imgUrl || null];
            db.query(query, values, (err, result) => {
                if (err) return reject({ error: 'Failed to add category', details: err });
                resolve({ message: 'Category added successfully', categoryId: id });
            });
        });
    },

    getCategories: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM categories';
            db.query(query, (err, results) => {
                if (err) return reject({ error: 'Failed to fetch categories', details: err });
                resolve(results);
            });
        });
    },

    getCategoryById: (categoryId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM categories WHERE id = ?';
            db.query(query, [categoryId], (err, results) => {
                if (err) return reject({ error: 'Failed to fetch category', details: err });
                if (results.length === 0) return reject({ error: 'Category not found' });
                resolve(results[0]);
            });
        });
    },

    deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM categories WHERE id = ?';
            db.query(query, [categoryId], (err, result) => {
                if (err) return reject({ error: 'Failed to delete category', details: err });
                if (result.affectedRows === 0) return reject({ error: 'Category not found' });
                resolve({ message: 'Category deleted successfully' });
            });
        });
    }
};

module.exports = categoryService;
