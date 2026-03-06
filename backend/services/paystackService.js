const https = require('https');

const PAYSTACK_CONFIG = {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
    apiUrl: 'api.paystack.co',
};

/**
 * Initialize a Paystack transaction
 * @param {string} email - Customer email
 * @param {number} amountGHS - Amount in GHS
 * @param {string} orderId - Our internal order number
 * @returns {Promise<{authorization_url, access_code, reference}>}
 */
const initiatePayment = async (email, amountGHS, orderId) => {
    // Paystack requires amount in the smallest subunit (pesewas for GHS)
    const amountSubunit = Math.round(amountGHS * 100);

    const payload = {
        email,
        amount: amountSubunit,
        currency: 'GHS',
        reference: orderId,
        callback_url: PAYSTACK_CONFIG.callbackUrl,
        metadata: {
            custom_fields: [
                {
                    display_name: "Order Number",
                    variable_name: "order_number",
                    value: orderId
                }
            ]
        }
    };

    const response = await makeRequest('/transaction/initialize', 'POST', payload);

    if (!response.status) {
        throw new Error(`Paystack initialization error: ${response.message}`);
    }

    return response.data; // { authorization_url, access_code, reference }
};

/**
 * Verify a Paystack transaction status
 * @param {string} reference - The transaction reference (our orderNumber)
 * @returns {Promise<any>}
 */
const verifyPaymentStatus = async (reference) => {
    const response = await makeRequest(`/transaction/verify/${encodeURIComponent(reference)}`, 'GET');

    if (!response.status) {
        throw new Error(`Paystack verification error: ${response.message}`);
    }

    return response.data; // Full transaction details
};

/**
 * HTTPS helper for Paystack API
 */
const makeRequest = (path, method, payload = null) => {
    return new Promise((resolve, reject) => {
        const body = payload ? JSON.stringify(payload) : null;

        const options = {
            hostname: PAYSTACK_CONFIG.apiUrl,
            port: 443,
            path,
            method,
            headers: {
                'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    reject(new Error('Invalid JSON response from Paystack'));
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
};

module.exports = { initiatePayment, verifyPaymentStatus };
