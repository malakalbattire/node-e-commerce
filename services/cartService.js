
const db = require('../models/db');

const cartService = {
    getCartItems: (userId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM cart WHERE user_id = ?';
            db.query(query, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    addItemToCart: (itemData) => {
        const { id, product, product_id, size, quantity, price, imgUrl, name, inStock, color, user_id } = itemData;
        return new Promise((resolve, reject) => {
            const checkQuery = `SELECT * FROM cart WHERE product_id = ? AND color = ? AND size = ? AND user_id = ?`;
            db.query(checkQuery, [product_id, color, size, user_id], (err, results) => {
                if (err) return reject(err);

                if (results.length > 0) {
                    const existingItem = results[0];
                    const newQuantity = existingItem.quantity + quantity;
                    const updateQuery = `UPDATE cart SET quantity = ?, inStock = inStock - ? WHERE id = ?`;
                    db.query(updateQuery, [newQuantity, quantity, existingItem.id], (err, updateResults) => {
                        if (err) return reject(err);
                        resolve({ message: 'Quantity updated', id: existingItem.id });
                    });
                } else {
                    const insertQuery = `
                        INSERT INTO cart (id, product, product_id, size, quantity, price, imgUrl, name, inStock, color, user_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    const values = [id, JSON.stringify(product), product_id, size, quantity, price, imgUrl, name, inStock, color, user_id];
                    db.query(insertQuery, values, (err, insertResults) => {
                        if (err) return reject(err);
                        resolve({ message: 'Item added to cart', id });
                    });
                }
            });
        });
    },

    updateCartItem: (id, itemData) => {
        const { product, size, quantity, price, img_url, name, in_stock, color } = itemData;
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE cart SET product = ?, size = ?, quantity = ?, price = ?, img_url = ?, name = ?, in_stock = ?, color = ?
                WHERE id = ?
            `;
            db.query(query, [JSON.stringify(product), size, quantity, price, img_url, name, in_stock, color, id], (err, results) => {
                if (err) return reject(err);
                resolve({ message: 'Cart item updated', id });
            });
        });
    },

    deleteCartItem: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM cart WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) return reject(err);
                resolve({ message: 'Cart item deleted', id });
            });
        });
    },

    clearCart: (userId) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM cart WHERE user_id = ?';
            db.query(query, [userId], (err, results) => {
                if (err) return reject(err);
                resolve({ message: 'Cart cleared successfully', userId });
            });
        });
    },

    incrementCartItem: (id, incrementBy) => {
        return new Promise((resolve, reject) => {
            if (!incrementBy || incrementBy <= 0) {
                return reject(new Error('Increment value must be greater than 0'));
            }

            const getCartItemQuery = 'SELECT quantity, inStock FROM cart WHERE id = ?';
            db.query(getCartItemQuery, [id], (err, results) => {
                if (err) return reject(err);

                if (results.length === 0) return reject(new Error('Cart item not found'));

                const cartItem = results[0];
                const newQuantity = cartItem.quantity + incrementBy;

                if (newQuantity > cartItem.inStock) {
                    return reject(new Error('Cannot exceed available stock'));
                }

                const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
                db.query(updateQuery, [newQuantity, id], (err, result) => {
                    if (err) return reject(err);
                    resolve({ message: 'Cart item quantity incremented successfully', id, newQuantity });
                });
            });
        });
    },

    decrementCartItem: (id, decrementBy) => {
        return new Promise((resolve, reject) => {
            if (!decrementBy || decrementBy <= 0) {
                return reject(new Error('Decrement value must be greater than 0'));
            }

            const getCartItemQuery = 'SELECT quantity, inStock FROM cart WHERE id = ?';
            db.query(getCartItemQuery, [id], (err, results) => {
                if (err) return reject(err);

                if (results.length === 0) return reject(new Error('Cart item not found'));

                const cartItem = results[0];
                const newQuantity = cartItem.quantity - decrementBy;

                if (newQuantity < 0) {
                    return reject(new Error('Quantity cannot be less than zero'));
                }

                const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
                db.query(updateQuery, [newQuantity, id], (err, result) => {
                    if (err) return reject(err);
                    resolve({ message: 'Cart item quantity decremented successfully', id, newQuantity });
                });
            });
        });
    }
};

module.exports = cartService;
