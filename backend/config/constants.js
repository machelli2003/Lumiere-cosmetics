module.exports = {
    ROLES: {
        USER: 'user',
        ADMIN: 'admin',
    },
    ORDER_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        PROCESSING: 'processing',
        SHIPPED: 'shipped',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded',
    },
    PAYMENT_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded',
    },
    PAYMENT_PROVIDERS: {
        PAYSTACK: 'paystack',
        COD: 'cod',
    },
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 12,
        MAX_LIMIT: 100,
    },
    COOKIE_OPTIONS: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
};