const bcrypt = require('bcryptjs');
const db = require('../models/db');

const authService = {
    login: (email, password) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return reject('User not found');

                const user = results[0];
                const isPasswordValid = bcrypt.compareSync(password, user.password);
                if (!isPasswordValid) return reject('Invalid password');

                resolve(user);
            });
        });
    },

    register: (email, password, username, userRole = 'user') => {
        return new Promise((resolve, reject) => {
            const hashedPassword = bcrypt.hashSync(password, 8);
            const query = 'INSERT INTO users (email, password, username, userRole) VALUES (?, ?, ?, ?)';
            db.query(query, [email, hashedPassword, username, userRole], (err, results) => {
                if (err) return reject('Error registering user');
                resolve({ id: results.insertId, email, username, userRole });
            });
        });
    },

    logout: (req) => {
        return new Promise((resolve, reject) => {
            req.session.destroy(err => {
                if (err) return reject('Error logging out');
                resolve('Logged out successfully');
            });
        });
    }
};

module.exports = authService;
