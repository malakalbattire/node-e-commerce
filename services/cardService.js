const db = require('../models/db');

const cardService = {
    getCardsByUserId: (userId) => {
        const sql = 'SELECT * FROM cards WHERE userId = ?';
        return new Promise((resolve, reject) => {
            db.query(sql, [userId], (err, results) => {
                if (err) return reject({ error: err.message });
                if (results.length === 0) return reject({ error: 'No cards found' });
                resolve(results);
            });
        });
    },

    addCard: (cardData) => {
        const { id, cardNumber, expiryDate, cvvCode, imgUrl, name, isSelected, userId } = cardData;
        const sql = `
            INSERT INTO cards (id, cardNumber, expiryDate, cvvCode, imgUrl, name, isSelected, userId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [id, cardNumber, expiryDate, cvvCode, imgUrl || 'https://i.pinimg.com/564x/56/65/ac/5665acfeb0668fe3ffdeb3168d3b38a4.jpg', name || 'Master Card', isSelected || false, userId];

        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) return reject({ error: err.message });
                resolve({ message: 'Card created successfully', cardId: id });
            });
        });
    },

    deleteCard: (id) => {
        const sql = 'DELETE FROM cards WHERE id = ?';
        return new Promise((resolve, reject) => {
            db.query(sql, [id], (err, result) => {
                if (err) return reject({ error: err.message });
                if (result.affectedRows === 0) return reject({ error: 'Card not found' });
                resolve({ message: 'Card deleted successfully', cardId: id });
            });
        });
    }
};

module.exports = cardService;
