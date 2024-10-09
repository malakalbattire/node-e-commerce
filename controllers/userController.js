const userService = require('../services/userService');

exports.getUser = (req, res) => {
    const { id } = req.params;
    userService.getUserById(id)
        .then(user => res.status(200).json(user))
        .catch(err => {
            if (err.message === 'User not found') {
                res.status(404).json({ message: err.message });
            } else {
                console.error('Error fetching user:', err);
                res.status(500).json({ message: 'Error fetching user' });
            }
        });
};

exports.createUser = (req, res) => {
    userService.createUser(req.body)
        .then(result => res.status(201).json(result))
        .catch(err => {
            console.error('Database insert error:', err);
            res.status(500).json({ error: 'Database insert error', details: err });
        });
};

exports.updateUser = (req, res,io) => {
    const { id, username } = req.body;
    userService.updateUser(id, username)
        .then(result => {
            io.emit('userUpdated', { id, username });
            res.status(200).json(result);
        })
        .catch(err => {
            console.error('Database update error:', err);
            res.status(500).json({ error: 'Database update error' });
        });
};
