
const db = require('../models/db');

const favoriteService = {
    addFavorite: ({ id, user_id, product_id, name, imgUrl, isFavorite, description, price, category }) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO favorites (id, user_id, product_id, name, imgUrl, isFavorite, description, price, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(query, [id, user_id, product_id, name, imgUrl, isFavorite, description, price, category], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    getFavorites: (user_id) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.id, p.name, p.imgUrl, p.price, p.category
                FROM favorites f
                JOIN products p ON f.product_id = p.id
                WHERE f.user_id = ? AND f.isFavorite = true;
            `;
            db.query(query, [user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    removeFavorite: (user_id, product_id) => {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM favorites
                WHERE user_id = ? AND product_id = ?;
            `;
            db.query(query, [user_id, product_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
};

module.exports = favoriteService;
