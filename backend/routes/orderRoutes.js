const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { createOrderValidation } = require('../middleware/validator');

router.post('/', protect, createOrderValidation, createOrder);
router.get('/my-orders', protect, getMyOrders);  // must be before /:id
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;