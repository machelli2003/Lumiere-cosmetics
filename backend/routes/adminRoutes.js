const express = require('express');
const router = express.Router();
const {
    getDashboard, getUsers, updateUser,
    getBrands, createBrand, updateBrand, deleteBrand,
    getCategories, createCategory, updateCategory, deleteCategory,
    uploadImage,
} = require('../controllers/adminController');
const { upload } = require('../config/cloudinary');
const { adminGetOrders, adminUpdateOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);

// Media Upload
router.post('/upload', upload.single('image'), uploadImage);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

// Orders
router.get('/orders', adminGetOrders);
router.put('/orders/:id', adminUpdateOrder);

// Brands
router.get('/brands', getBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;