const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const { success, error, paginated } = require('../utils/apiResponse');
const { getPaginationOptions } = require('../utils/paginate');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboard = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
        totalUsers,
        newUsersThisMonth,
        totalOrders,
        ordersThisMonth,
        revenueResult,
        revenueLastMonth,
        totalProducts,
        lowStockProducts,
        recentOrders,
        ordersByStatus,
        topProducts,
    ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.aggregate([
            { $match: { 'payment.status': PAYMENT_STATUS.COMPLETED } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } },
        ]),
        Order.aggregate([
            {
                $match: {
                    'payment.status': PAYMENT_STATUS.COMPLETED,
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
                },
            },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } },
        ]),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: true, stock: { $lte: 5 }, hasVariants: false }),
        Order.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber status pricing.total createdAt user')
            .lean(),
        Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Product.find({ isActive: true })
            .sort({ totalSold: -1 })
            .limit(5)
            .select('name basePrice totalSold images')
            .populate('brand', 'name')
            .lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const lastMonthRevenue = revenueLastMonth[0]?.total || 0;
    const revenueGrowth = lastMonthRevenue > 0
        ? (((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : null;

    // Monthly revenue chart (last 6 months)
    const monthlyRevenue = await Order.aggregate([
        { $match: { 'payment.status': PAYMENT_STATUS.COMPLETED } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                revenue: { $sum: '$pricing.total' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
    ]);

    return success(res, {
        overview: {
            totalUsers,
            newUsersThisMonth,
            totalOrders,
            ordersThisMonth,
            totalRevenue,
            revenueGrowth,
            totalProducts,
            lowStockProducts,
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        recentOrders,
        topProducts,
        monthlyRevenue: monthlyRevenue.reverse(),
    });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, role } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
    ]);

    return paginated(res, users, page, limit, total);
});

// @desc    Update user role/status (admin)
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
    const { role, isActive } = req.body;

    if (req.params.id === req.user._id.toString()) {
        return error(res, 'You cannot modify your own admin account this way.', 400);
    }

    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return error(res, 'User not found.', 404);

    return success(res, { user }, 'User updated');
});

// Brand management
const getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find().sort({ sortOrder: 1, name: 1 }).lean();
    return success(res, { brands });
});

const createBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.create(req.body);
    return success(res, { brand }, 'Brand created');
});

const updateBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return error(res, 'Brand not found.', 404);
    return success(res, { brand }, 'Brand updated');
});

const deleteBrand = asyncHandler(async (req, res) => {
    const productCount = await Product.countDocuments({ brand: req.params.id });
    if (productCount > 0) {
        return error(res, `Cannot delete brand with ${productCount} products. Reassign products first.`, 400);
    }
    await Brand.findByIdAndDelete(req.params.id);
    return success(res, null, 'Brand deleted');
});

// Category management
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find()
        .populate('parent', 'name slug')
        .sort({ sortOrder: 1, name: 1 })
        .lean();
    return success(res, { categories });
});

const createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    return success(res, { category }, 'Category created');
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return error(res, 'Category not found.', 404);
    return success(res, { category }, 'Category updated');
});

const deleteCategory = asyncHandler(async (req, res) => {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
        return error(res, `Cannot delete category with ${productCount} products. Reassign products first.`, 400);
    }
    await Category.findByIdAndDelete(req.params.id);
    return success(res, null, 'Category deleted');
});

// @desc    Upload image to Cloudinary
// @route   POST /api/admin/upload
// @access  Admin
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) return error(res, 'No file uploaded', 400);
    return success(res, { url: req.file.path }, 'Image uploaded successfully');
});

module.exports = {
    getDashboard,
    getUsers,
    updateUser,
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadImage,
};