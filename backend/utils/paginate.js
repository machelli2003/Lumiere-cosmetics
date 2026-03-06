const { PAGINATION } = require('../config/constants');

/**
 * Build pagination options from query params
 */
const getPaginationOptions = (query) => {
    const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
        parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Build MongoDB sort object from sort query string
 * e.g., "price" → { price: 1 }, "-price" → { price: -1 }
 */
const buildSortOptions = (sortQuery, allowedFields = ['basePrice', 'price', 'createdAt', 'name', 'averageRating', 'totalSold']) => {
    if (!sortQuery) return { createdAt: -1 };

    const sortObj = {};
    const fields = sortQuery.split(',');

    fields.forEach((field) => {
        const isDesc = field.startsWith('-');
        let fieldName = isDesc ? field.substring(1) : field;

        // Map 'price' to 'basePrice' strictly for database consistency
        if (fieldName === 'price') fieldName = 'basePrice';

        if (allowedFields.includes(fieldName) || fieldName === 'basePrice') {
            sortObj[fieldName] = isDesc ? -1 : 1;
        }
    });

    return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 };
};

module.exports = { getPaginationOptions, buildSortOptions };