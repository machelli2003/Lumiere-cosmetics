const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_PROVIDERS } = require('../config/constants');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name: { type: String, required: true },
    image: { type: String, default: null },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantLabel: { type: String, default: null },
});

orderItemSchema.virtual('subtotal').get(function () {
    return this.price * this.quantity;
});

const paymentSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: Object.values(PAYMENT_PROVIDERS),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
    },
    transactionId: { type: String, default: null }, // MoMo transId
    requestId: { type: String, default: null }, // MoMo requestId
    orderId: { type: String, default: null }, // MoMo orderId (our reference)
    amount: { type: Number, required: true },
    currency: { type: String, default: 'VND' },
    payUrl: { type: String, default: null },
    resultCode: { type: Number, default: null }, // MoMo result code
    rawResponse: { type: mongoose.Schema.Types.Mixed, default: null },
    paidAt: { type: Date, default: null },
});

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        // Support Ghana-style address fields coming from the frontend
        shippingAddress: {
            // Frontend provides firstName / lastName; keep fullName optional for backward compatibility
            firstName: { type: String, required: true },
            lastName: { type: String, default: null },
            fullName: { type: String, default: null },
            phone: { type: String, required: true },
            // Frontend uses `address` (house/street/area)
            address: { type: String, required: true },
            // City / Town
            city: { type: String, required: true },
            // Region (maps to previous district field)
            region: { type: String, required: true },
            // Ghana-only defaults
            country: { type: String, default: 'Ghana' },
        },
        pricing: {
            subtotal: { type: Number, required: true },
            shippingFee: { type: Number, default: 0 },
            discount: { type: Number, default: 0 },
            tax: { type: Number, default: 0 },
            total: { type: Number, required: true },
        },
        payment: paymentSchema,
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PENDING,
        },
        statusHistory: [
            {
                status: String,
                changedAt: { type: Date, default: Date.now },
                note: String,
            },
        ],
        notes: { type: String, default: null },
        estimatedDelivery: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.transactionId': 1 });

// Pre-save: add to status history on status change
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({ status: this.status });
    }
    next();
});

// Static: generate order number
orderSchema.statics.generateOrderNumber = function () {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LUM-${timestamp}-${random}`;
};

module.exports = mongoose.model('Order', orderSchema);