const db = require('../models/db');

const orderService = {
    placeOrder: (orderData) => {
        const {
            id, userId, items, cityName, productIds, addressId, paymentId, countryName,
            firstName, lastName, phoneNumber, cardNumber, totalAmount, orderNumber, orderStatus
        } = orderData;

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO orders (
                    id, userId, items, cityName, productIds, addressId, paymentId, countryName,
                    firstName, lastName, phoneNumber, cardNumber, totalAmount, createdAt, orderNumber, orderStatus
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
            `;

            const values = [
                id, userId, JSON.stringify(items), cityName, JSON.stringify(productIds), addressId, paymentId,
                countryName, firstName, lastName, phoneNumber, cardNumber, totalAmount, orderNumber,
                JSON.stringify(orderStatus)
            ];

            db.query(query, values, (err, result) => {
                if (err) return reject({ error: 'Error placing order', details: err });
                resolve({
                    message: 'Order placed successfully',
                    orderId: id,
                    insertId: result.insertId
                });
            });
        });
    },

    getOrders: (userId) => {
        let query = 'SELECT * FROM orders';
        let queryParams = [];

        if (userId) {
            query += ' WHERE userId = ?';
            queryParams.push(userId);
        }

        return new Promise((resolve, reject) => {
            db.query(query, queryParams, (err, results) => {
                if (err) return reject({ error: 'Failed to retrieve orders', details: err });
                resolve(results);
            });
        });
    },

    updateOrderStatus: (orderId, newStatus) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE orders SET orderStatus = ? WHERE id = ?`;
            db.query(query, [JSON.stringify(newStatus), orderId], (err, result) => {
                if (err) return reject({ error: 'Database error', details: err });
                if (result.affectedRows === 0) return reject({ error: 'Order not found' });
                resolve({ message: 'Order status updated successfully' });
            });
        });
    },

    getOrderStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT orderStatus FROM orders WHERE id = ?';
            db.query(query, [orderId], (err, results) => {
                if (err) return reject({ error: 'Failed to retrieve order status', details: err });
                if (results.length === 0) return reject({ error: 'Order not found' });
                resolve({ orderId, orderStatus: results[0].orderStatus });
            });
        });
    }
};

module.exports = orderService;
