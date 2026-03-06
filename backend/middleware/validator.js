const { validationResult, body, param, query } = require('express-validator');
const { error } = require('../utils/apiResponse');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return error(
            res,
            'Validation failed',
            422,
            errors.array().map((e) => ({ field: e.path, message: e.msg }))
        );
    }
    next();
};

const registerValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/(?=.*[A-Z])(?=.*[0-9])/)
        .withMessage('Password must contain at least one uppercase letter and one number'),
    validate,
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('brand').isMongoId().withMessage('Valid brand ID is required'),
    body('category').isMongoId().withMessage('Valid category ID is required'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    validate,
];

const addToCartValidation = [
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('variantId').optional({ nullable: true }).isMongoId().withMessage('Valid variant ID is required'),
    validate,
];

const updateCartValidation = [
    param('itemId').isMongoId().withMessage('Valid item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate,
];

// Updated for Ghana address format
const createOrderValidation = [
    body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
    body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
    body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
    body('shippingAddress.address').trim().notEmpty().withMessage('Delivery address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.region').trim().notEmpty().withMessage('Region is required'),
    body('paymentProvider').isIn(['paystack', 'cod']).withMessage('Invalid payment provider'),
    validate,
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    productValidation,
    addToCartValidation,
    updateCartValidation,
    createOrderValidation,
};