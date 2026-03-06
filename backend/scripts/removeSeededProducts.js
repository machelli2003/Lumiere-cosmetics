require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const seededSlugs = [
  'charlotte-tilbury-magic-cream',
  'la-mer-creme-moisturizing',
  'sulwhasoo-first-care-serum',
  'nars-soft-matte-foundation',
  'charlotte-tilbury-black-loulou-lipstick',
  'sisley-black-rose-cream-mask',
  'la-mer-concentrated-serum',
  'sulwhasoo-ginseng-serum',
];

const run = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set in .env');
    await mongoose.connect(uri);
    const res = await Product.deleteMany({ slug: { $in: seededSlugs } });
    console.log('Deleted products count:', res.deletedCount);
    process.exit(0);
  } catch (err) {
    console.error('Error removing seeded products:', err.message || err);
    process.exit(1);
  }
};

run();
