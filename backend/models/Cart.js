const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    name: { type: String, required: true },
    image: { type: String, default: null },
    price: { type: Number, required: true },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    variantLabel: { type: String, default: null }, // e.g., "Color: Ruby Red"
});

cartItemSchema.virtual('subtotal').get(function () {
    return this.price * this.quantity;
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
        couponCode: { type: String, default: null },
        discount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: subtotal before discount
cartSchema.virtual('subtotal').get(function () {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Virtual: item count
cartSchema.virtual('itemCount').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual: total after discount
cartSchema.virtual('total').get(function () {
    return Math.max(0, this.subtotal - this.discount);
});

module.exports = mongoose.model('Cart', cartSchema);