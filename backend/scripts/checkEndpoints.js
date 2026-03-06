// Simple script to check public product endpoints
(async () => {
  try {
    const base = process.env.BASE_URL || 'http://localhost:5000';
    const endpoints = ['/api/products/brands', '/api/products/categories'];

    for (const ep of endpoints) {
      const res = await fetch(base + ep);
      const json = await res.json();
      console.log('Endpoint:', ep);
      console.log('Status:', res.status);
      console.log('Body:', JSON.stringify(json, null, 2));
      console.log('---');
    }
  } catch (err) {
    console.error('Error checking endpoints:', err.message || err);
    process.exit(1);
  }
})();
