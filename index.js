const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass1234',
    database: 'db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const sessionStoreOptions = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '14MALAKan.',
    database: 'db'
};

const sessionStore = new MySQLStore(sessionStoreOptions);

app.use(session({
    key: 'user_sid',
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false
    }
}));

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('Backend is working!');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query error', details: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        req.session.userId = user.id;
        req.session.userRole = user.userRole;

        return res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            userRole: user.userRole
        });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send({ message: 'Error logging out' });
        }
        res.clearCookie('user_sid');
        res.status(200).send({ message: 'Logged out successfully' });
    });
});
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
   console.log(`Fetching user with ID: ${id}`);

    db.query('SELECT * FROM users WHERE id = ?', [id], (error, rows) => {
        if (!error) {
            if (rows.length > 0) {
                res.json(rows[0]);
            } else {
                console.log('User not found in database');
                res.status(404).send({ message: 'User not found' });
            }
        } else {
            console.log('Database query error:', error);
            res.status(500).send({ message: 'Error fetching user' });
        }
    });
});
app.post('/users', (req, res) => {
    const { id, email, username, userRole, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (id, email, username, userRole, password) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [id, email, username, userRole, hashedPassword], (err, results) => {
        if (err) {
            console.error('Database insert error:', err);
            res.status(500).json({ error: 'Database insert error', details: err });
            return;
        }
        res.status(200).send('User registered successfully');
    });
});
app.get('/session/check', (req, res) => {
    if (req.session.userId) {
        return res.status(200).json({ message: 'User is logged in', userId: req.session.userId });
    } else {
        return res.status(401).json({ message: 'User is not logged in' });
    }
});



app.get('/products', (req, res) => {
    const categoryName = req.query.category;
    const productName = req.query.name;

    if (categoryName && productName) {
        const query = `SELECT * FROM products WHERE category = ? AND name LIKE ?`;
        db.query(query, [categoryName, `%${productName}%`], (err, results) => {
            if (err) {
                console.error('Error fetching products by category and name:', err);
                return res.status(500).json({ error: 'Failed to fetch products' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No products found for this category and name' });
            }

            res.status(200).json(results);
        });
    }
    else if (categoryName) {
        const query = `SELECT * FROM products WHERE category = ?`;
        db.query(query, [categoryName], (err, results) => {
            if (err) {
                console.error('Error fetching products by category:', err);
                return res.status(500).json({ error: 'Failed to fetch products' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No products found for this category' });
            }

            res.status(200).json(results);
        });
    }
    else if (productName) {
        const query = `SELECT * FROM products WHERE name LIKE ?`;
        db.query(query, [`%${productName}%`], (err, results) => {
            if (err) {
                console.error('Error fetching products by name:', err);
                return res.status(500).json({ error: 'Failed to fetch products' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No products found for this name' });
            }

            res.status(200).json(results);
        });
    }
    else {
        db.query('SELECT * FROM products', (error, rows) => {
            if (!error) {
                res.status(200).json(rows);
            } else {
                console.log(error);
                res.status(500).send({ message: 'Error fetching products' });
            }
        });
    }
});
app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM products WHERE id = ?', [id], (error, rows, fields) => {
        if (!error) {
            if (rows.length > 0) {
                res.json(rows[0]);
            } else {
                res.status(404).send({ message: 'Product not found' });
            }
        } else {
            console.log(error);
            res.status(500).send({ message: 'Error fetching product' });
        }
    });
});
app.post('/products', (req, res) => {
  const { id, name, imgUrl, description, price, category, sizes, inStock, colors } = req.body;

  const sizesArray = Array.isArray(sizes) ? JSON.stringify(sizes) : null;
  const colorsArray = Array.isArray(colors) ? JSON.stringify(colors) : null;

  const sql = 'INSERT INTO products (id, name, imgUrl, description, price, category, sizes, inStock, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [id, name, imgUrl, description, price, category, sizesArray, inStock, colorsArray], (err, result) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).send('Error inserting product');
    }
    io.emit('productAdded', { id, name, imgUrl, description, price, category, sizes, inStock, colors });
    res.status(200).send('Product added successfully');

  });
});
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send('Product ID is required');
    }

    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).send('Error deleting product');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Product not found');
        }
        io.emit('productDeleted', { id });

        res.status(200).send('Product deleted successfully');

    });
});
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, inStock } = req.body;


    if (!id) {
        return res.status(400).send('Product ID is required');
    }

    const sql = `
      UPDATE products
      SET name = ?, description = ?, price = ?, inStock = ?
      WHERE id = ?`;

    db.query(sql, [name, description, price, inStock, id], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).send('Error updating product');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Product not found');
        }
        io.emit('productUpdated', { id, name, description, price, inStock });

        res.status(200).send('Product updated successfully');
    });
});







//favorites=============


app.post('/favorites', (req, res) => {
    const { user_id, product_id, name, imgUrl, isFavorite, description, price, category } = req.body;

    const id = uuidv4();

    const query = `
        INSERT INTO favorites (id, user_id, product_id, name, imgUrl, isFavorite, description, price, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [id, user_id, product_id, name, imgUrl, isFavorite, description, price, category], (err, results) => {
        if (err) {
            console.error('Error inserting data into favorites:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        io.emit('favoriteAdded', { user_id, product_id, name, imgUrl, description, price, category });

        res.status(201).json({ message: 'Favorite added successfully', favoriteId: id });
    });
});
app.get('/favorites/:user_id', (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT p.id, p.name, p.imgUrl, p.price, p.category
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    WHERE f.user_id = ? AND f.isFavorite = true;
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching favorites:', err);
      return res.status(500).send('Error fetching favorites');
    }
    res.status(200).json(results);
  });
});
app.post('/favorites/remove', (req, res) => {
  const { user_id, product_id } = req.body;

  const sql = `
    DELETE FROM favorites
    WHERE user_id = ? AND product_id = ?;
  `;

  db.query(sql, [user_id, product_id], (err, result) => {
    if (err) {
      console.error('Error removing favorite:', err);
      return res.status(500).send('Error removing favorite');
    }

    io.emit('favoriteRemoved', { user_id, product_id });

    res.status(200).send('Product removed from favorites successfully');
  });
});








//cart=========================

app.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM cart WHERE user_id = ?';
    console.log('User ID:', userId);

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.log('Error getting items from cart:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Results:', results);
        res.status(200).json(results);
    });
});
app.post('/cart', (req, res) => {
    const { id, product, product_id, size, quantity, price, imgUrl, name, inStock, color, user_id } = req.body;

    const checkQuery = `
        SELECT * FROM cart
        WHERE product_id = ? AND color = ? AND size = ? AND user_id = ?
    `;
    const checkValues = [product_id, color, size, user_id];

    db.query(checkQuery, checkValues, (err, results) => {
        if (err) {
            console.error('Error checking cart item:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            const existingItem = results[0];
            const newQuantity = existingItem.quantity + quantity;

            const updateQuery = `
                UPDATE cart
                SET quantity = ?, inStock = inStock - ?
                WHERE id = ?
            `;
            const updateValues = [newQuantity, quantity, existingItem.id];

            db.query(updateQuery, updateValues, (err, updateResults) => {
                if (err) {
                    console.error('Error updating cart quantity:', err.message);
                    return res.status(500).json({ error: err.message });
                }

                return res.status(200).json({ message: 'Quantity updated', id: existingItem.id });
            });
        } else {
            const insertQuery = `
                INSERT INTO cart (id, product, product_id, size, quantity, price, imgUrl, name, inStock, color, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [id, JSON.stringify(product), product_id, size, quantity, price, imgUrl, name, inStock, color, user_id];

            db.query(insertQuery, values, (err, insertResults) => {
                if (err) {
                    console.error('Error adding item to cart:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                io.emit('cartUpdated', { user_id, product_id, action: 'added', id });
                res.status(201).json({ message: 'Item added to cart', id });
            });
        }
    });
});
app.put('/cart/:id', (req, res) => {
    const id = req.params.id;
    const { product, size, quantity, price, img_url, name, in_stock, color } = req.body;
    const query = `
        UPDATE cart
        SET product = ?, size = ?, quantity = ?, price = ?, img_url = ?, name = ?, in_stock = ?, color = ?
        WHERE id = ?
    `;
    const values = [JSON.stringify(product), size, quantity, price, img_url, name, in_stock, color, id];
    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        io.emit('cartUpdated', { id, action: 'updated' });

        res.status(200).json({ message: 'Cart item updated', id });
    });
});
app.delete('/cart/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM cart WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        io.emit('cartUpdated', { id, action: 'deleted' });
        res.status(200).json({ message: 'Cart item deleted', id });
    });
});
app.put('/cart/:id/increment', (req, res) => {
    const id = req.params.id;
    const { incrementBy } = req.body;

    if (!incrementBy || incrementBy <= 0) {
        return res.status(400).send('Increment value must be greater than 0');
    }

    const getCartItemQuery = 'SELECT quantity, inStock FROM cart WHERE id = ?';
    db.query(getCartItemQuery, [id], (err, results) => {
        if (err) {
            console.error('Error fetching cart item:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).send('Cart item not found');
        }

        const cartItem = results[0];
        const newQuantity = cartItem.quantity + incrementBy;

        if (newQuantity > cartItem.inStock) {
            return res.status(400).send('Cannot exceed available stock');
        }

        const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
        db.query(updateQuery, [newQuantity, id], (err, result) => {
            if (err) {
                console.error('Error updating cart item:', err.message);
                return res.status(500).json({ error: err.message });
            }
            io.emit('cartUpdated', { id, action: 'incremented', newQuantity });

            res.status(200).send('Cart item quantity updated successfully');
        });
    });
});
app.put('/cart/:id/decrement', (req, res) => {
    const id = req.params.id;
    const { decrementBy } = req.body;

    if (!decrementBy || decrementBy <= 0) {
        return res.status(400).send('Decrement value must be greater than 0');
    }

    const getCartItemQuery = 'SELECT quantity, inStock FROM cart WHERE id = ?';
    db.query(getCartItemQuery, [id], (err, results) => {
        if (err) {
            console.error('Error fetching cart item:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).send('Cart item not found');
        }

        const cartItem = results[0];
        const newQuantity = cartItem.quantity - decrementBy;

        if (newQuantity < 0) {
            return res.status(400).send('Quantity cannot be less than zero');
        }

        const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
        db.query(updateQuery, [newQuantity, id], (err, result) => {
            if (err) {
                console.error('Error updating cart item:', err.message);
                return res.status(500).json({ error: err.message });
            }
            io.emit('cartUpdated', { id, action: 'decrement', newQuantity });

            res.status(200).send('Cart item quantity updated successfully');
        });
    });
});
app.delete('/cart/:userId/clear', (req, res) => {
    const userId = req.params.userId;

    console.log(`Request to clear cart for userId: ${userId}`);

    const clearCartQuery = 'DELETE FROM cart WHERE user_id = ?';
    db.query(clearCartQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error clearing cart:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Cart not found or already empty');
        }
        io.emit('cartCleared', { user_id: userId });
        res.status(200).send('Cart cleared successfully');
    });
});

///////cards=========

app.get('/cards/:userId', (req, res) => {
    console.log('Received a request');

    const userId = req.params.userId;
    console.log('Received request for userId:', userId);

    const sql = 'SELECT * FROM cards WHERE userId = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log('Database query results:', results);
        if (results.length === 0) {
            console.log('No cards found for userId:', userId);
            return res.status(404).json({ error: 'Card not found' });
        }

        res.status(200).json(results);
    });
});





app.post('/cards', (req, res) => {
  const { id, cardNumber, expiryDate, cvvCode, imgUrl, name, isSelected, userId } = req.body;

  const sql = 'INSERT INTO cards (id, cardNumber, expiryDate, cvvCode, imgUrl, name, isSelected, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [id, cardNumber, expiryDate, cvvCode, imgUrl || 'https://i.pinimg.com/564x/56/65/ac/5665acfeb0668fe3ffdeb3168d3b38a4.jpg', name || 'Master Card', isSelected || false, userId ];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.status(201).json({ message: 'Card created successfully', cardId: id });
  });
});

app.delete('/cards/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM cards WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json({ message: 'Card deleted successfully' });
  });
});







//addresses===========
app.post('/addresses', (req, res) => {
  const { id, firstName, lastName, countryName, cityName, phoneNumber, isSelected, userId } = req.body;
  const sql = 'INSERT INTO addresses (id, firstName, lastName, countryName, cityName, phoneNumber, isSelected, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [id, firstName, lastName, countryName, cityName, phoneNumber, isSelected || false, userId];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Address added successfully', addressId: id });
  });
});

app.delete('/addresses/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM addresses WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
     if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'ADDRESS not found' });
        }

            res.json({ message: 'address deleted successfully' });

  });
});

app.get('/addresses/:userId', (req, res) => {

    console.log('Received a request');

  const userId = req.params.userId;

    console.log('Received request for userId:', userId);
  const sql ='SELECT * FROM addresses WHERE userId = ?';

  db.query(sql, [userId], (err, results) => {
    if (err) {
          console.error('Error fetching address:', err);

    return res.status(500).json({ error: err.message });}


     console.log('Database query results:', results);
            if (results.length === 0) {
                console.log('No cards found for userId:', userId);
                return res.status(404).json({ error: 'Card not found' });
            }

            res.status(200).json(results);
  });
});



//orders=========

app.post('/orders', (req, res) => {
    console.log('Received request to place order:', req.body);

    const {
        id, userId, items, cityName, productIds, addressId, paymentId, countryName,
        firstName, lastName, phoneNumber, cardNumber, totalAmount, orderNumber, orderStatus
    } = req.body;

    if (!id || !userId) {
        return res.status(400).json({ error: 'id and userId are required.' });
    }

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
        if (err) {
            console.error('Error placing order:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Order placed successfully:', result.insertId);
        res.status(201).json({
            message: 'Order placed successfully',
            orderId: id,
            insertId: result.insertId
        });
    });
});
app.get('/orders', (req, res) => {
  const userId = req.query.userId;
  let query = 'SELECT * FROM orders';
  let queryParams = [];

  if (userId) {
    query += ' WHERE userId = ?';
    queryParams.push(userId);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve orders.' });
    }

    res.status(200).json(results);
  });
});
app.put('/orders/:orderId/orderStatus', (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.orderStatus;

  console.log(`Received request to update order ${orderId} with status ${JSON.stringify(newStatus)}`);

  if (!newStatus || !Array.isArray(newStatus)) {
    return res.status(400).send({ error: 'Invalid orderStatus format' });
  }

  const sql = `UPDATE orders SET orderStatus = ? WHERE id = ?`;
  console.log(`SQL Query: ${sql}, Values: ${JSON.stringify([JSON.stringify(newStatus), orderId])}`);

  db.query(sql, [JSON.stringify(newStatus), orderId], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).send({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Order not found' });
    }

    res.send({ message: 'Order status updated successfully' });
  });
});
app.get('/orders/:orderId/status', (req, res) => {
    const orderId = req.params.orderId;

    console.log(`Received request to get status for order ${orderId}`);

    const query = 'SELECT orderStatus FROM orders WHERE id = ?';

    db.query(query, [orderId], (err, results) => {
        if (err) {
            console.error('Error fetching order status:', err);
            return res.status(500).json({ error: 'Failed to retrieve order status.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({
            orderId: orderId,
            orderStatus: results[0].orderStatus
        });
    });
});

//category=============================


app.post('/categories', (req, res) => {
  const { id, name, imgUrl } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: 'Please provide id and name' });
  }

  const query = `INSERT INTO categories (id, name, imgUrl) VALUES (?, ?, ?)`;
  const values = [id, name, imgUrl || null];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding category:', err);
      return res.status(500).json({ error: 'Failed to add category' });
    }
    res.status(201).json({ message: 'Category added successfully', categoryId: id });
  });
});
app.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.status(200).json(results);
  });
});
app.get('/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const query = 'SELECT * FROM categories WHERE id = ?';

  db.query(query, [categoryId], (err, results) => {
    if (err) {
      console.error('Error fetching category by ID:', err);
      return res.status(500).json({ error: 'Failed to fetch category' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(results[0]);
  });
});
app.delete('/categories/:id', (req, res) => {
  const categoryId = req.params.id;
   console.log('Received request to delete category ID:', categoryId);
  const query = 'DELETE FROM categories WHERE id = ?';

  db.query(query, [categoryId], (err, result) => {
    if (err) {
      console.error('Error deleting category:', err);
      return res.status(500).json({ error: 'Failed to delete category' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  });
});

const ngrok = require('ngrok');

(async function() {
    const url = await ngrok.connect(3000); // Replace 3000 with the port your app runs on
    console.log(`Ngrok URL: ${url}`);
})();

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
