const db = require('../models/db');
const bcrypt = require('bcryptjs');

const userService = {
    getUserById: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE id = ?';
            db.query(query, [id], (error, rows) => {
                if (error) {
                    return reject(error);
                }
                if (rows.length > 0) {
                    resolve(rows[0]);
                } else {
                    reject(new Error('User not found'));
                }
            });
        });
    },

    createUser: (userData) => {
        const { id, email, username, userRole, password } = userData;
        const hashedPassword = bcrypt.hashSync(password, 8);

        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO users (id, email, username, userRole, password) VALUES (?, ?, ?, ?, ?)';
            db.query(query, [id, email, username, userRole, hashedPassword], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve({ message: 'User registered successfully', userId: id });
            });
        });
    },

    updateUser: (id, newUsername) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET username = ? WHERE id = ?';
            db.query(query, [newUsername, id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve({ message: 'User updated successfully', userId: id });
            });
        });
    }
};

module.exports = userService;
