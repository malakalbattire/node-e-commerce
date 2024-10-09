const productService = require('../services/productService');

exports.getProducts = (req, res) => {
    const { category, name } = req.query;

    productService.getProducts(category, name)
        .then(products => {
            if (products.length === 0) {
                res.status(404).json({ message: 'No products found' });
            } else {
                res.status(200).json(products);
            }
        })
        .catch(err => res.status(500).json(err));
};

exports.getProductById = (req, res) => {
    const { id } = req.params;

    productService.getProductById(id)
        .then(product => res.status(200).json(product))
        .catch(err => res.status(err.error === 'Product not found' ? 404 : 500).json(err));
};

exports.addProduct = (req, res) => {
    const productData = req.body;

    productService.addProduct(productData)
        .then(response => res.status(201).json(response))
        .catch(err => res.status(500).json(err));
};

exports.deleteProduct = (req, res) => {
    const { id } = req.params;

    productService.deleteProduct(id)
        .then(response => res.status(200).json(response))
        .catch(err => res.status(err.error === 'Product not found' ? 404 : 500).json(err));
};

exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const productData = req.body;

    productService.updateProduct(id, productData)
        .then(response => res.status(200).json(response))
        .catch(err => res.status(err.error === 'Product not found' ? 404 : 500).json(err));
};
