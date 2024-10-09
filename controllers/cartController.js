
const cartService = require('../services/cartService');

exports.getCart = (req, res) => {
    const userId = req.params.userId;
    cartService.getCartItems(userId)
        .then(results => res.status(200).json(results))
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.addToCart = (req, res, io) => {
    console.log('Socket IO add to cart:', io);
    const itemData = req.body;
    cartService.addItemToCart(itemData)
        .then(result => {
            io.emit('cartUpdated', { user_id: itemData.user_id, product_id: itemData.product_id, action: 'added', id: result.id });
            res.status(201).json(result);
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.updateCart = (req, res,io) => {
console.log('Socket IO update :', req.io);
    const id = req.params.id;
    const itemData = req.body;
    cartService.updateCartItem(id, itemData)
        .then(result => {
            io.emit('cartUpdated', { id, action: 'updated' });
            res.status(200).json(result);
        })
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.deleteCartItem = (req, res,io) => {
console.log('Socket IO delete:', io);
    const id = req.params.id;
    cartService.deleteCartItem(id)
        .then(result => {
            io.emit('cartUpdated', { id, action: 'deleted' });
            res.status(200).json(result);
        })
        .catch(err => res.status(500).json({ error: err.message }));
};
exports.incrementCart = (req, res) => {
    const id = req.params.id;
    const { incrementBy } = req.body;
    cartService.incrementCartItem(id, incrementBy)
        .then(result => res.status(200).json(result))
        .catch(err => res.status(400).json({ error: err.message }));
};

exports.decrementCart = (req, res) => {
    const id = req.params.id;
    const { decrementBy } = req.body;
    cartService.decrementCartItem(id, decrementBy)
        .then(result => res.status(200).json(result))
        .catch(err => res.status(400).json({ error: err.message }));
};

exports.clearCart = (req, res) => {
    const userId = req.params.userId;
    cartService.clearCart(userId)
        .then(result => {
            io.emit('cartCleared', { user_id: userId });
            res.status(200).json(result);
        })
        .catch(err => res.status(500).json({ error: err.message }));
};
