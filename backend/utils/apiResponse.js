const success = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const created = (res, data = null, message = 'Created successfully') => {
    return success(res, data, message, 201);
};

const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

const paginated = (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    });
};

module.exports = { success, created, error, paginated };