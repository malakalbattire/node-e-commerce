const authService = require('../services/authService');

exports.login = (req, res) => {
    const { email, password } = req.body;
    authService.login(email, password)
        .then(user => {
            req.session.userId = user.id;
            req.session.userRole = user.userRole;
            res.status(200).json(user);
        })
        .catch(err => res.status(401).json({ error: err }));
};

exports.register = (req, res) => {
    const { email, password, username, userRole } = req.body;
    authService.register(email, password, username, userRole)
        .then(user => {
            req.session.userId = user.id;
            req.session.userRole = user.userRole;
            res.status(201).json({ message: 'User registered successfully', user });
        })
        .catch(err => res.status(400).json({ error: err }));
};

exports.logout = (req, res) => {
    authService.logout(req)
        .then(message => {
            res.clearCookie('user_sid');
            res.status(200).json({ message });
        })
        .catch(err => res.status(500).json({ error: err }));
};
