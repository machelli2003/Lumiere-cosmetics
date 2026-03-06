const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: `LUMIÈRE Cosmetics <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

// ── Email Templates ──────────────────────────────────────────

const getOrderConfirmationTemplate = (order, user) => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f0e6d2;">
                <p style="margin: 0; font-weight: bold; font-size: 14px;">${item.product?.name || 'Product'}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #6b5a41;">Qty: ${item.quantity}</p>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f0e6d2; text-align: right; font-weight: bold;">
                GH₵ ${(item.price * item.quantity).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </td>
        </tr>
    `).join('');

    return `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c241a; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37;">
            <div style="background-color: #2c241a; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; letter-spacing: 5px; margin: 0; font-weight: 300; font-size: 28px;">LUMIÈRE</h1>
                <p style="color: #d4af37; letter-spacing: 2px; text-transform: uppercase; font-size: 10px; margin-top: 10px;">Luxury Beauty Rituals</p>
            </div>
            <div style="padding: 40px; background-color: #fdfaf5;">
                <h2 style="font-weight: 300; font-size: 22px; margin-top: 0;">Order Confirmed</h2>
                <p style="line-height: 1.6;">Hello ${user.firstName},</p>
                <p style="line-height: 1.6;">Your beauty ritual has been secured. We've received your order <strong>#${order.orderNumber}</strong> and our artisans are preparing it for delivery.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                    <thead>
                        <tr style="background-color: #f0e6d2;">
                            <th style="padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Ritual</th>
                            <th style="padding: 12px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="padding: 12px; font-weight: bold; text-align: right;">Total</td>
                            <td style="padding: 12px; font-weight: bold; text-align: right; font-size: 18px; color: #d4af37;">
                                GH₵ ${order.pricing.total.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top: 40px; padding: 20px; background-color: #ffffff; border: 1px solid #f0e6d2;">
                    <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Delivery To:</h3>
                    <p style="font-size: 14px; margin-bottom: 4px;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
                    <p style="font-size: 14px; margin: 0; color: #6b5a41;">${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="${process.env.CLIENT_URL}/orders" style="background-color: #2c241a; color: #ffffff; padding: 18px 30px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Track My Ritual</a>
                </div>
            </div>
            <div style="background-color: #f0e6d2; padding: 20px; text-align: center; font-size: 10px; color: #6b5a41; letter-spacing: 1px;">
                © 2026 LUMIÈRE COSMETICS · ACCRA, GHANA
            </div>
        </div>
    `;
};

module.exports = {
    sendEmail,
    getOrderConfirmationTemplate
};
