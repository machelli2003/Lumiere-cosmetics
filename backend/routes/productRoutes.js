const express = require('express');
const router = express.Router();
const {
    getProducts, getProductBySlug, createProduct,
    updateProduct, deleteProduct, addReview, getFeaturedProducts,
    getBrands, getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Static routes MUST come before /:slug
router.get('/featured', getFeaturedProducts);
router.get('/brands', getBrands);
router.get('/categories', getCategories);

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;