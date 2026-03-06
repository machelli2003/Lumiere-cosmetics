const { error } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
    const err = new Error(`Route not found: ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
};

const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose: Cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        message = `Invalid ${err.path}: ${err.value}`;
        statusCode = 400;
    }

    // Mongoose: Duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
        statusCode = 409;
    }

    // Mongoose: Validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return error(res, 'Validation failed', 422, errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${err.stack}`);
    }

    return error(res, message, statusCode);
};

module.exports = { notFound, globalErrorHandler };