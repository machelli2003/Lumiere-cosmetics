// cartRoutes.js
const express = require('express');
const cartRouter = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { addToCartValidation, updateCartValidation } = require('../middleware/validator');

cartRouter.get('/', protect, getCart);
cartRouter.post('/add', protect, addToCartValidation, addToCart);
cartRouter.put('/update/:itemId', protect, updateCartValidation, updateCartItem);
cartRouter.delete('/remove/:itemId', protect, removeCartItem);
cartRouter.delete('/clear', protect, clearCart);

module.exports = { cartRouter };