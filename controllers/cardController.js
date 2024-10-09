const cardService = require('../services/cardService');

exports.getCardsByUserId = (req, res) => {
    const { userId } = req.params;
    cardService.getCardsByUserId(userId)
        .then(cards => res.status(200).json(cards))
        .catch(err => res.status(err.error === 'No cards found' ? 404 : 500).json(err));
};

exports.addCard = (req, res) => {
    const cardData = req.body;
    cardService.addCard(cardData)
        .then(response => res.status(201).json(response))
        .catch(err => res.status(500).json(err));
};

exports.deleteCard = (req, res) => {
    const { id } = req.params;
    cardService.deleteCard(id)
        .then(response => res.status(200).json(response))
        .catch(err => res.status(err.error === 'Card not found' ? 404 : 500).json(err));
};
