const MySQLStore = require('express-mysql-session')(require('express-session'));
const session = require('express-session');

const sessionStore = new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass1234',
    database: 'db'
});

const sessionConfig = session({
    key: 'user_sid',
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false
    }
});

module.exports = sessionConfig;
