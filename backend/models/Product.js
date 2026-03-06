const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Shade", "Size"
    value: { type: String, required: true }, // e.g., "Ruby Red", "30ml"
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: null },
});

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: { type: String, maxlength: 200 },
        comment: { type: String, maxlength: 1000 },
        isVerifiedPurchase: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        shortDescription: {
            type: String,
            maxlength: [500, 'Short description cannot exceed 500 characters'],
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: [true, 'Brand is required'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        tags: [{ type: String, lowercase: true, trim: true }],
        images: [
            {
                url: { type: String, required: true },
                alt: { type: String, default: '' },
                isPrimary: { type: Boolean, default: false },
            },
        ],
        // Base price (used when no variants)
        basePrice: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        compareAtPrice: {
            type: Number,
            default: null,
        },
        // Stock (used when no variants)
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        hasVariants: {
            type: Boolean,
            default: false,
        },
        variants: [variantSchema],
        // Product details
        ingredients: { type: String, default: null },
        howToUse: { type: String, default: null },
        skinType: [
            {
                type: String,
                enum: ['all', 'dry', 'oily', 'combination', 'sensitive', 'normal'],
            },
        ],
        weight: { type: Number, default: null }, // grams
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
        },
        // SEO
        metaTitle: { type: String, default: null },
        metaDescription: { type: String, default: null },
        // Reviews
        reviews: [reviewSchema],
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        // Status
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        isBestSeller: { type: Boolean, default: false },
        isNewArrival: { type: Boolean, default: false },
        // Sales tracking
        totalSold: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ isActive: 1, isFeatured: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual: discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.basePrice) {
        return Math.round(((this.compareAtPrice - this.basePrice) / this.compareAtPrice) * 100);
    }
    return 0;
});

// Virtual: effective stock (considers variants)
productSchema.virtual('totalStock').get(function () {
    if (this.hasVariants && this.variants.length > 0) {
        return this.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return this.stock;
});

// Virtual: primary image
productSchema.virtual('primaryImage').get(function () {
    if (!this.images || this.images.length === 0) return null;
    return this.images.find((img) => img.isPrimary) || this.images[0];
});

// Pre-save: update review stats
productSchema.methods.updateReviewStats = function () {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
        this.reviewCount = 0;
    } else {
        const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
        this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
        this.reviewCount = this.reviews.length;
    }
};

module.exports = mongoose.model('Product', productSchema);