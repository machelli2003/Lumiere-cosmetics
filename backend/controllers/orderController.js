const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { success, created, error, paginated } = require('../utils/apiResponse');
const { getPaginationOptions } = require('../utils/paginate');
const { ORDER_STATUS, PAYMENT_PROVIDERS } = require('../config/constants');

const SHIPPING_FEE = 30000; // 30,000 VND flat rate
const FREE_SHIPPING_THRESHOLD = 500000; // Free shipping over 500k VND

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentProvider, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return error(res, 'Your cart is empty.', 400);
    }

    // Validate stock for all items
    const stockErrors = [];
    const orderItems = [];

    for (const item of cart.items) {
        const product = item.product;

        if (!product || !product.isActive) {
            stockErrors.push(`${item.name} is no longer available.`);
            continue;
        }

        let availableStock = product.stock;
        let currentPrice = product.basePrice;

        if (item.variantId) {
            const variant = product.variants.id(item.variantId);
            if (!variant) {
                stockErrors.push(`Variant for ${item.name} not found.`);
                continue;
            }
            availableStock = variant.stock;
            currentPrice = variant.price;
        }

        if (item.quantity > availableStock) {
            stockErrors.push(
                `${item.name}: only ${availableStock} units available, you requested ${item.quantity}.`
            );
            continue;
        }

        orderItems.push({
            product: product._id,
            variantId: item.variantId || null,
            name: item.name,
            image: item.image,
            price: currentPrice, // Use current price, not cart price (prevent manipulation)
            quantity: item.quantity,
            variantLabel: item.variantLabel || null,
        });
    }

    if (stockErrors.length > 0) {
        return error(res, 'Some items have stock issues. Please review your cart.', 400, stockErrors);
    }

    // Calculate pricing
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const discount = cart.discount || 0;
    const total = Math.max(0, subtotal + shippingFee - discount);

    const orderNumber = Order.generateOrderNumber();

    const order = await Order.create({
        orderNumber,
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        pricing: { subtotal, shippingFee, discount, tax: 0, total },
        payment: {
            provider: paymentProvider,
            amount: total,
            status: 'pending',
        },
        notes,
        status: ORDER_STATUS.PENDING,
    });

    // Deduct stock (optimistic — reverse on payment failure if needed)
    for (const item of orderItems) {
        if (item.variantId) {
            await Product.updateOne(
                { _id: item.product, 'variants._id': item.variantId },
                { $inc: { 'variants.$.stock': -item.quantity, totalSold: item.quantity } }
            );
        } else {
            await Product.updateOne(
                { _id: item.product },
                { $inc: { stock: -item.quantity, totalSold: item.quantity } }
            );
        }
    }

    // Clear cart
    await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [], discount: 0, couponCode: null }
    );

    return created(res, { order }, 'Order created successfully');
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);

    const [orders, total] = await Promise.all([
        Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-statusHistory -__v')
            .lean(),
        Order.countDocuments({ user: req.user._id }),
    ]);

    return paginated(res, orders, page, limit, total);
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
    }).populate('items.product', 'name slug images');

    if (!order) return error(res, 'Order not found.', 404);

    return success(res, { order });
});

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) return error(res, 'Order not found.', 404);

    const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.PAID];
    if (!cancellableStatuses.includes(order.status)) {
        return error(res, `Cannot cancel an order with status "${order.status}".`, 400);
    }

    // Restore stock
    for (const item of order.items) {
        if (item.variantId) {
            await Product.updateOne(
                { _id: item.product, 'variants._id': item.variantId },
                { $inc: { 'variants.$.stock': item.quantity, totalSold: -item.quantity } }
            );
        } else {
            await Product.updateOne(
                { _id: item.product },
                { $inc: { stock: item.quantity, totalSold: -item.quantity } }
            );
        }
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    return success(res, { order }, 'Order cancelled successfully');
});

// ADMIN routes

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Admin
const adminGetOrders = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) filter.orderNumber = { $regex: search, $options: 'i' };

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments(filter),
    ]);

    return paginated(res, orders, page, limit, total);
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id
// @access  Admin
const adminUpdateOrder = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return error(res, 'Order not found.', 404);

    order.status = status;
    if (note) {
        order.statusHistory[order.statusHistory.length - 1].note = note;
    }
    if (status === ORDER_STATUS.DELIVERED) {
        order.deliveredAt = new Date();
    }

    await order.save();

    return success(res, { order }, 'Order status updated');
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    adminGetOrders,
    adminUpdateOrder,
};