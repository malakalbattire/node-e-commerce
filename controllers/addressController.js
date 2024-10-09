const addressService = require('../services/addressService');

exports.addAddress = (req, res) => {
    const addressData = req.body;

    addressService.addAddress(addressData)
        .then(response => res.status(201).json(response))
        .catch(err => res.status(500).json(err));
};

exports.deleteAddress = (req, res) => {
    const { id } = req.params;

    addressService.deleteAddress(id)
        .then(response => res.status(200).json(response))
        .catch(err => res.status(err.error === 'Address not found' ? 404 : 500).json(err));
};

exports.getAddressesByUserId = (req, res) => {
    const { userId } = req.params;

    addressService.getAddressesByUserId(userId)
        .then(addresses => res.status(200).json(addresses))
        .catch(err => res.status(err.error === 'No addresses found for this user' ? 404 : 500).json(err));
};
