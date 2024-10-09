const db = require('../models/db');

const addressService = {
    addAddress: (addressData) => {
        const { id, firstName, lastName, countryName, cityName, phoneNumber, isSelected, userId } = addressData;
        const sql = `
            INSERT INTO addresses (id, firstName, lastName, countryName, cityName, phoneNumber, isSelected, userId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [id, firstName, lastName, countryName, cityName, phoneNumber, isSelected || false, userId];

        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) return reject({ error: err.message });
                resolve({ message: 'Address added successfully', addressId: id });
            });
        });
    },

    deleteAddress: (id) => {
        const sql = 'DELETE FROM addresses WHERE id = ?';

        return new Promise((resolve, reject) => {
            db.query(sql, [id], (err, result) => {
                if (err) return reject({ error: err.message });
                if (result.affectedRows === 0) return reject({ error: 'Address not found' });
                resolve({ message: 'Address deleted successfully', addressId: id });
            });
        });
    },

    getAddressesByUserId: (userId) => {
        const sql = 'SELECT * FROM addresses WHERE userId = ?';

        return new Promise((resolve, reject) => {
            db.query(sql, [userId], (err, results) => {
                if (err) return reject({ error: err.message });
                if (results.length === 0) return reject({ error: 'No addresses found for this user' });
                resolve(results);
            });
        });
    }
};

module.exports = addressService;
