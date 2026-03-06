const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Order = require('../models/Order');
const { success, error } = require('../utils/apiResponse');
const { initiatePayment, verifyPaymentStatus } = require('../services/paystackService');
const { PAYMENT_STATUS, ORDER_STATUS, PAYMENT_PROVIDERS } = require('../config/constants');
const { sendEmail, getOrderConfirmationTemplate } = require('../utils/email');
const User = require('../models/User');

// @desc    Initiate Paystack payment for an order
// @route   POST /api/payment/paystack/initiate
// @access  Private
const initiatePaystackPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) return error(res, 'Order not found.', 404);

    if (order.payment.status === PAYMENT_STATUS.COMPLETED) {
        return error(res, 'This order has already been paid.', 400);
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
        return error(res, 'Cannot pay for a cancelled order.', 400);
    }

    try {
        const { authorization_url, reference } = await initiatePayment(
            req.user.email,
            order.pricing.total,
            order.orderNumber
        );

        // Save Paystack reference to order
        order.payment.method = PAYMENT_PROVIDERS.PAYSTACK;
        order.payment.orderId = reference; // In Paystack, reference = orderNumber
        order.payment.payUrl = authorization_url;
        await order.save();

        return success(res, { payUrl: authorization_url, reference }, 'Payment initiated');
    } catch (err) {
        return error(res, err.message || 'Paystack initialization failed', 500);
    }
});

// @desc    Paystack Webhook - called by Paystack server
// @route   POST /api/payment/paystack/webhook
// @access  Public
const paystackWebhook = asyncHandler(async (req, res) => {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-paystack-signature'];

    // Verify webhook signature
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(payload)
        .digest('hex');

    if (hash !== signature) {
        console.error('[Paystack Webhook] Invalid signature');
        return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    // Only handle successful charge transactions
    if (event.event === 'charge.success') {
        const { reference, amount, status, transId } = event.data;
        const order = await Order.findOne({ orderNumber: reference });

        if (order && status === 'success') {
            order.payment.status = PAYMENT_STATUS.COMPLETED;
            order.payment.transactionId = String(event.data.id || transId || '');
            order.payment.paidAt = new Date();
            order.payment.rawResponse = event.data;
            order.status = ORDER_STATUS.PAID;
            await order.save();
            console.log(`[Paystack Webhook] ✅ Payment confirmed for Order ${reference}`);

            // Send Confirmation Email
            try {
                const user = await User.findById(order.user);
                await order.populate('items.product', 'name');
                const html = getOrderConfirmationTemplate(order, user);
                await sendEmail({
                    email: user.email,
                    subject: `Ritual Secured: Order #${order.orderNumber}`,
                    html
                });
            } catch (mailErr) {
                console.error('[Paystack Webhook] Email failed:', mailErr.message);
            }
        }
    }

    return res.status(200).send('Webhook Received');
});

// @desc    Verify payment status (called by frontend after redirect/callback)
// @route   GET /api/payment/paystack/verify/:reference
// @access  Private
const verifyPaystackPayment = asyncHandler(async (req, res) => {
    const { reference } = req.params;

    try {
        const paystackData = await verifyPaymentStatus(reference);
        const order = await Order.findOne({ orderNumber: reference, user: req.user._id });

        if (!order) return error(res, 'Order not found.', 404);

        if (paystackData.status === 'success' && order.payment.status !== PAYMENT_STATUS.COMPLETED) {
            order.payment.status = PAYMENT_STATUS.COMPLETED;
            order.payment.transactionId = String(paystackData.id);
            order.payment.paidAt = new Date(paystackData.paid_at);
            order.payment.rawResponse = paystackData;
            order.status = ORDER_STATUS.PAID;
            await order.save();

            // Send Confirmation Email
            try {
                const user = await User.findById(order.user);
                await order.populate('items.product', 'name');
                const html = getOrderConfirmationTemplate(order, user);
                await sendEmail({
                    email: user.email,
                    subject: `Ritual Secured: Order #${order.orderNumber}`,
                    html
                });
            } catch (mailErr) {
                console.error('[Verify Payment] Email failed:', mailErr.message);
            }
        }

        return success(res, {
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.payment.status,
            amount: order.pricing.total,
        });
    } catch (err) {
        return error(res, 'Could not verify payment with Paystack', 500);
    }
});

module.exports = { initiatePaystackPayment, paystackWebhook, verifyPaystackPayment };