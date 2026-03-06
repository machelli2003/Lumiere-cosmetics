const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { success, error } = require('../utils/apiResponse');

// Helper: get or create cart
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

// Helper: validate product & get price
const getProductDetails = async (productId, variantId) => {
    const product = await Product.findById(productId).populate('brand', 'name');
    if (!product || !product.isActive) {
        throw { statusCode: 404, message: 'Product not found or unavailable.' };
    }

    let price, stock, variantLabel, image;

    if (variantId && product.hasVariants) {
        const variant = product.variants.id(variantId);
        if (!variant) throw { statusCode: 404, message: 'Product variant not found.' };
        if (variant.stock < 1) throw { statusCode: 400, message: 'This variant is out of stock.' };
        price = variant.price;
        stock = variant.stock;
        variantLabel = `${variant.name}: ${variant.value}`;
        image = variant.image || product.primaryImage?.url;
    } else {
        if (product.totalStock < 1) throw { statusCode: 400, message: 'Product is out of stock.' };
        price = product.basePrice;
        stock = product.stock;
        image = product.primaryImage?.url;
    }

    return { price, stock, variantLabel, image, name: product.name };
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate('items.product', 'name slug isActive basePrice images');
    return success(res, { cart });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1, variantId } = req.body;

    const { price, stock, variantLabel, image, name } = await getProductDetails(productId, variantId);

    if (quantity > stock) {
        return error(res, `Only ${stock} units available in stock.`, 400);
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if same item already in cart
    const existingIndex = cart.items.findIndex(
        (item) =>
            item.product.toString() === productId &&
            (variantId ? item.variantId?.toString() === variantId : !item.variantId)
    );

    if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + quantity;
        if (newQty > stock) {
            return error(res, `Cannot add more. Only ${stock} units available.`, 400);
        }
        cart.items[existingIndex].quantity = newQty;
    } else {
        cart.items.push({
            product: productId,
            variantId: variantId || null,
            name,
            image,
            price,
            quantity,
            variantLabel: variantLabel || null,
        });
    }

    await cart.save();
    return success(res, { cart, itemCount: cart.itemCount }, 'Item added to cart');
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return error(res, 'Cart not found.', 404);

    const item = cart.items.id(req.params.itemId);
    if (!item) return error(res, 'Item not found in cart.', 404);

    // Validate stock
    const product = await Product.findById(item.product);
    if (product) {
        let stock = product.stock;
        if (item.variantId) {
            const variant = product.variants.id(item.variantId);
            if (variant) stock = variant.stock;
        }
        if (quantity > stock) {
            return error(res, `Only ${stock} units available.`, 400);
        }
    }

    item.quantity = quantity;
    await cart.save();

    return success(res, { cart }, 'Cart updated');
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return error(res, 'Cart not found.', 404);

    cart.items = cart.items.filter(
        (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    return success(res, { cart }, 'Item removed from cart');
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], discount: 0, couponCode: null });
    return success(res, null, 'Cart cleared');
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };