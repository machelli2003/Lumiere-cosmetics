const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const { created, error, success } = require('../utils/apiResponse');
const { sendEmail } = require('../utils/email');

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
const createMessage = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return error(res, 'Name, email and message are required.', 400);
    }

    const doc = await Contact.create({ name, email, message });
    // Send notification email to support/admin if configured
    try {
        const to = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER;
        if (to) {
            const subject = `New contact message from ${name}`;
            const html = `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br/>')}</p>
                <hr/>
                <p>View messages in the admin panel or via the backend.</p>
            `;
            await sendEmail({ email: to, subject, html });
        }
    } catch (emailErr) {
        // Log email errors but don't fail the request
        // eslint-disable-next-line no-console
        console.error('Contact email notification failed:', emailErr);
    }
    return created(res, { contact: doc }, 'Message received.');
});

// @desc    List contact messages (admin)
// @route   GET /api/contact
// @access  Private (admin)
const listMessages = asyncHandler(async (req, res) => {
    const messages = await Contact.find().sort({ createdAt: -1 }).limit(200);
    return success(res, { messages });
});

module.exports = { createMessage, listMessages };
