const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/generateToken');
const { success, created, error } = require('../utils/apiResponse');
const { COOKIE_OPTIONS } = require('../config/constants');

const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return error(res, 'An account with this email already exists.', 409);
    }

    const user = await User.create({ firstName, lastName, email, password });

    // Initialize empty cart for new user
    await Cart.create({ user: user._id, items: [] });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    return created(res, {
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
        accessToken,
    }, 'Account created successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user || !(await user.comparePassword(password))) {
        return error(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
        return error(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    return success(res, {
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
        accessToken,
    }, 'Logged in successfully');
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public (with refresh token cookie)
const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return error(res, 'Refresh token not found.', 401);
    }

    try {
        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            return error(res, 'Invalid refresh token.', 401);
        }

        const newAccessToken = generateAccessToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, newAccessToken, newRefreshToken);

        return success(res, { accessToken: newAccessToken }, 'Token refreshed');
    } catch {
        return error(res, 'Invalid or expired refresh token.', 401);
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
    // Clear refresh token in DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return success(res, null, 'Logged out successfully');
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    return success(res, { user });
});

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
    const updates = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
    });

    return success(res, { user }, 'Profile updated successfully');
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
        return error(res, 'Current password is incorrect.', 400);
    }

    user.password = newPassword;
    await user.save();

    return success(res, null, 'Password changed successfully');
});

// @desc    Add address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (req.body.isDefault) {
        user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.addresses.push(req.body);
    await user.save();

    return success(res, { addresses: user.addresses }, 'Address added');
});

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { addresses: { _id: req.params.addressId } },
    });
    return success(res, null, 'Address removed');
});

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    updateProfile,
    changePassword,
    addAddress,
    deleteAddress,
};