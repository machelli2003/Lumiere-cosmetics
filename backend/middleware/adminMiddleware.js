const { ROLES } = require('../config/constants');
const { error } = require('../utils/apiResponse');

/**
 * Restrict route to admin only
 * Must be used AFTER protect middleware
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === ROLES.ADMIN) {
        return next();
    }
    return error(res, 'Access denied. Admin privileges required.', 403);
};

module.exports = { adminOnly };