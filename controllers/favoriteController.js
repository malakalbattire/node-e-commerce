
const favoriteService = require('../services/favoriteService');

exports.addFavorite = (req, res, io) => {
    const { user_id, product_id, name, imgUrl, isFavorite, description, price, category } = req.body;
    const id = require('uuid').v4();

    favoriteService.addFavorite({ id, user_id, product_id, name, imgUrl, isFavorite, description, price, category })
        .then(() => {
            io.emit('favoriteAdded', { user_id, product_id, name, imgUrl, description, price, category });
            res.status(201).json({ message: 'Favorite added successfully', favoriteId: id });
        })
        .catch(err => {
            console.error('Error adding favorite:', err);
            res.status(500).json({ error: 'Database error' });
        });
};

exports.getFavorites = (req, res) => {
    const { user_id } = req.params;

    favoriteService.getFavorites(user_id)
        .then(results => res.status(200).json(results))
        .catch(err => {
            console.error('Error fetching favorites:', err);
            res.status(500).json({ error: 'Error fetching favorites' });
        });
};

exports.removeFavorite = (req, res, io) => {
    const { user_id, product_id } = req.body;

    favoriteService.removeFavorite(user_id, product_id)
        .then(() => {
            io.emit('favoriteRemoved', { user_id, product_id });
            res.status(200).send('Product removed from favorites successfully');
        })
        .catch(err => {
            console.error('Error removing favorite:', err);
            res.status(500).json({ error: 'Error removing favorite' });
        });
};
