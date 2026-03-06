require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { notFound, globalErrorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const { cartRouter } = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
// Allow trust proxy (required on platforms like Render so rate-limit can read X-Forwarded-For)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false, // More permissive for development/external assets
    })
);
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins in development or if it matches the CLIENT_URL
            if (process.env.NODE_ENV === 'development' || !origin || [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173', 'https://lumiere-cosmetics-1.onrender.com'].includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Blocked by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Stricter for auth routes
    message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

app.use(generalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// MoMo webhook needs raw body for signature verification — must come before json parser
app.use('/api/payment/momo/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    if (Buffer.isBuffer(req.body)) {
        req.body = JSON.parse(req.body.toString());
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Handle malformed JSON bodies gracefully
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    next(err);
});

// Serve uploaded files
// Serve uploaded files and allow cross-origin access for frontend (CORP)
app.use(
    '/uploads',
    (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
    },
    express.static(path.join(__dirname, 'uploads'))
);

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0',
    });
});

// Root route for platform probes
app.get('/', (req, res) => {
    res.json({ success: true, message: 'API is running. Use /api endpoints.' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║        LUMIÈRE COSMETICS API             ║
  ║  Server running on port ${PORT}             ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}           ║
  ╚══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`[UNHANDLED REJECTION] ${err.message}`);
    server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('[SIGTERM] Gracefully shutting down...');
    server.close(() => console.log('[SIGTERM] Server closed.'));
});

module.exports = app;