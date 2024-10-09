const orderService = require('../services/orderService');

exports.placeOrder = (req, res) => {
    const orderData = req.body;

    orderService.placeOrder(orderData)
        .then(response => res.status(201).json(response))
        .catch(err => res.status(500).json(err));
};

exports.getOrders = (req, res) => {
    const userId = req.query.userId;

    orderService.getOrders(userId)
        .then(orders => res.status(200).json(orders))
        .catch(err => res.status(500).json(err));
};

exports.updateOrderStatus = (req, res) => {
    const orderId = req.params.orderId;
    const { orderStatus } = req.body;

    orderService.updateOrderStatus(orderId, orderStatus)
        .then(response => res.status(200).json(response))
        .catch(err => res.status(err.error === 'Order not found' ? 404 : 500).json(err));
};

exports.getOrderStatus = (req, res) => {
    const orderId = req.params.orderId;

    orderService.getOrderStatus(orderId)
        .then(status => res.status(200).json(status))
        .catch(err => res.status(err.error === 'Order not found' ? 404 : 500).json(err));
};
