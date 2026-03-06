const express = require('express');
const router = express.Router();
const { createMessage, listMessages } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Public: create a contact message
router.post('/', createMessage);

// Admin: list messages
router.get('/', protect, adminOnly, listMessages);

module.exports = router;
