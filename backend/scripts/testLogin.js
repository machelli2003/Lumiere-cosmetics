const http = require('http');
const https = require('https');
const urlLib = require('url');

const email = process.env.ADMIN_EMAIL || 'admin@lumiere.com';
const password = process.env.ADMIN_PASSWORD_PLAIN || 'Halamadrid15';
const base = process.env.BASE_URL || 'http://localhost:5000';
const endpoint = '/api/auth/login';

const run = () => {
  try {
    const full = new URL(endpoint, base);
    const data = JSON.stringify({ email, password });
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const lib = full.protocol === 'https:' ? https : http;
    const req = lib.request(full, opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
      });
    });
    req.on('error', (e) => console.error('Request error:', e.message || e));
    req.write(data);
    req.end();
  } catch (err) {
    console.error('Run error:', err.message || err);
  }
};

run();
