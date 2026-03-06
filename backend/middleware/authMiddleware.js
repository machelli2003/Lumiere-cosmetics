const asyncHandler = require('express-async-handler');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

/**
 * Protect routes - require valid JWT
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check Authorization header first, then cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return error(res, 'Authentication required. Please log in.', 401);
    }

    try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return error(res, 'User not found. Token is invalid.', 401);
        }

        if (!user.isActive) {
            return error(res, 'Your account has been deactivated. Please contact support.', 403);
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return error(res, 'Session expired. Please log in again.', 401);
        }
        return error(res, 'Invalid authentication token.', 401);
    }
});

/**
 * Optional auth - attach user if token present, but don't block
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (token) {
        try {
            const decoded = verifyAccessToken(token);
            req.user = await User.findById(decoded.id).select('-password');
        } catch {
            req.user = null;
        }
    }
    next();
});

module.exports = { protect, optionalAuth };