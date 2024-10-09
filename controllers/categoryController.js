const categoryService = require('../services/categoryService');

exports.addCategory = (req, res) => {
    const { id, name, imgUrl } = req.body;
    if (!id || !name) {
        return res.status(400).json({ error: 'Please provide id and name' });
    }

    categoryService.addCategory({ id, name, imgUrl })
        .then(response => res.status(201).json(response))
        .catch(err => res.status(500).json(err));
};

exports.getCategories = (req, res) => {
    categoryService.getCategories()
        .then(categories => res.status(200).json(categories))
        .catch(err => res.status(500).json(err));
};

exports.getCategoryById = (req, res) => {
    const categoryId = req.params.id;
    categoryService.getCategoryById(categoryId)
        .then(category => res.status(200).json(category))
        .catch(err => {
            const statusCode = err.error === 'Category not found' ? 404 : 500;
            res.status(statusCode).json(err);
        });
};

exports.deleteCategory = (req, res) => {
    const categoryId = req.params.id;
    categoryService.deleteCategory(categoryId)
        .then(response => res.status(200).json(response))
        .catch(err => {
            const statusCode = err.error === 'Category not found' ? 404 : 500;
            res.status(statusCode).json(err);
        });
};
