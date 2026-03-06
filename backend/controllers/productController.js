const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const { success, created, error, paginated } = require('../utils/apiResponse');
const { getPaginationOptions, buildSortOptions } = require('../utils/paginate');

// @desc    Get all products (with filtering, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, brand, category, minPrice, maxPrice, sort, tags, skinType, isFeatured, isBestSeller, isNewArrival } = req.query;

    const filter = { isActive: true };

    if (search) {
        // Try text search first, or fallback to regex for partial matches
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (brand) {
        if (mongoose.Types.ObjectId.isValid(brand)) {
            filter.brand = brand;
        } else {
            const b = await Brand.findOne({ slug: brand }).select('_id').lean();
            if (b) filter.brand = b._id;
        }
    }

    if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
            filter.category = category;
        } else {
            const cat = await Category.findOne({ slug: category }).select('_id').lean();
            if (cat) filter.category = cat._id;
        }
    }

    if (minPrice || maxPrice) {
        filter.basePrice = {};
        if (minPrice) filter.basePrice.$gte = Number(minPrice);
        if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    if (tags) {
        const tagArray = tags.split(',').map((t) => t.trim().toLowerCase());
        filter.tags = { $in: tagArray };
    }

    if (skinType) {
        const types = skinType.split(',').map(s => s.trim());
        filter.skinType = { $in: types };
    }

    if (isFeatured === 'true') filter.isFeatured = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (isNewArrival === 'true') filter.isNewArrival = true;

    const sortOptions = buildSortOptions(sort);

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('brand', 'name slug')
            .populate('category', 'name slug')
            .select('-ingredients -howToUse')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    return paginated(res, products, page, limit, total);
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
        .populate('brand', 'name slug logo description')
        .populate('category', 'name slug')
        .populate('reviews.user', 'firstName lastName avatar');

    if (!product) return error(res, 'Product not found.', 404);

    const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        isActive: true,
    })
        .populate('brand', 'name slug')
        .select('name slug basePrice compareAtPrice images averageRating reviewCount brand')
        .limit(8)
        .lean();

    return success(res, { product, related });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (req.file && req.file.filename) {
        const url = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
        body.images = [{ url, isPrimary: true }];
    }
    const product = await Product.create(body);
    await product.populate('brand', 'name slug');
    await product.populate('category', 'name slug');
    return created(res, { product }, 'Product created successfully');
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (req.file && req.file.filename) {
        const url = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
        body.images = [{ url, isPrimary: true }];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    })
        .populate('brand', 'name slug')
        .populate('category', 'name slug');

    if (!product) return error(res, 'Product not found.', 404);
    return success(res, { product }, 'Product updated successfully');
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );
    if (!product) return error(res, 'Product not found.', 404);
    return success(res, null, 'Product removed successfully');
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) return error(res, 'You have already reviewed this product.', 400);

    product.reviews.push({ user: req.user._id, rating: Number(rating), title, comment });
    product.updateReviewStats();
    await product.save();
    return created(res, null, 'Review submitted successfully');
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true, isFeatured: true })
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .select('-reviews -ingredients -howToUse')
        .limit(12)
        .lean();
    return success(res, { products });
});

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find({}).sort({ sortOrder: 1, name: 1 }).lean();
    return success(res, brands);
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();
    return success(res, categories);
});

module.exports = {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
    getFeaturedProducts,
    getBrands,
    getCategories,
};