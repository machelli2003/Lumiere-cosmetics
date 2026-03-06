const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Brand name is required'],
            trim: true,
            unique: true,
            maxlength: [100, 'Brand name cannot exceed 100 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        logo: {
            type: String,
            default: null,
        },
        coverImage: {
            type: String,
            default: null,
        },
        origin: {
            type: String, // e.g., "France", "South Korea", "USA"
            default: null,
        },
        website: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: product count (populated when needed)
brandSchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'brand',
    count: true,
});

brandSchema.index({ isActive: 1, isFeatured: -1 });


module.exports = mongoose.model('Brand', brandSchema);