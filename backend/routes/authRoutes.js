const express = require('express');
const router = express.Router();
const {
    register, login, logout, refreshToken,
    getMe, updateProfile, changePassword,
    addAddress, deleteAddress,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validator');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Helpful GET for browsers or accidental GET requests
router.get('/login', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'This endpoint accepts POST requests. Send a POST to /api/auth/login with JSON {email, password} to authenticate.'
    });
});

module.exports = router;