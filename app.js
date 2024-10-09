
module.exports = function(app, io) {
    const bodyParser = require('body-parser');
    const cors = require('cors');
    const sessionConfig = require('./models/sessionStore');


    app.use(cors({ origin: '*', credentials: true }));
    app.use(bodyParser.json());
    app.use(sessionConfig);

    const authController = require('./controllers/authController');
    const cartController = require('./controllers/cartController');
    const userController = require('./controllers/userController');
    const categoryController = require('./controllers/categoryController');
    const favoriteController = require('./controllers/favoriteController');
    const orderController = require('./controllers/orderController');
    const productController = require('./controllers/productController');
    const addressController = require('./controllers/addressController');
    const cardController = require('./controllers/cardController');

    app.post('/login', authController.login);
    app.post('/register', authController.register);
    app.post('/logout', authController.logout);

    app.get('/cart/:userId', (req, res) => cartController.getCart(req, res, io));
    app.post('/cart', (req, res) => cartController.addToCart(req, res, io));
    app.put('/cart/:id', (req, res) => cartController.updateCart(req, res, io));
    app.put('/cart/:id/increment', (req, res) => cartController.incrementCart(req, res, io));
    app.put('/cart/:id/decrement', (req, res) => cartController.decrementCart(req, res, io));
    app.delete('/cart/:id', (req, res) => cartController.deleteCartItem(req, res, io));
    app.delete('/cart/:userId/clear', (req, res) => cartController.clearCart(req, res, io));

    app.get('/users/:id', userController.getUser);
    app.post('/users', userController.createUser);
    app.post('/users/update', (req, res) =>  userController.updateUser(req, res, io));

    app.post('/categories', categoryController.addCategory);
    app.get('/categories', categoryController.getCategories);
    app.get('/categories/:id', categoryController.getCategoryById);
    app.delete('/categories/:id', categoryController.deleteCategory);


app.post('/favorites', (req, res) => favoriteController.addFavorite(req, res, io));
app.get('/favorites/:user_id', (req, res) => favoriteController.getFavorites(req, res));
app.post('/favorites/remove', (req, res) => favoriteController.removeFavorite(req, res, io));

    app.post('/orders', orderController.placeOrder);
    app.get('/orders', orderController.getOrders);
    app.put('/orders/:orderId/orderStatus', orderController.updateOrderStatus);
    app.get('/orders/:orderId/status', orderController.getOrderStatus);

    app.get('/products', productController.getProducts);
    app.get('/products/:id', productController.getProductById);
    app.post('/products', productController.addProduct);
    app.delete('/products/:id', productController.deleteProduct);
    app.put('/products/:id', productController.updateProduct);

    app.post('/addresses', addressController.addAddress);
    app.delete('/addresses/:id', addressController.deleteAddress);
    app.get('/addresses/:userId', addressController.getAddressesByUserId);

    app.get('/cards/:userId', cardController.getCardsByUserId);
    app.post('/cards', cardController.addCard);
    app.delete('/cards/:id', cardController.deleteCard);
}
