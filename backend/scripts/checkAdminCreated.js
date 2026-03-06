require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const uri = process.env.MONGO_URI;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@lumiere.com';

if (!uri) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(uri);
    const user = await User.findOne({ email: adminEmail }).select('+password').lean();
    if (!user) {
      console.log(`No user found with email: ${adminEmail}`);
      process.exit(2);
    }
    console.log('Admin user found:');
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- CreatedAt: ${user.createdAt}`);
    console.log(`- Password (hash): ${user.password}`);
    console.log(`- ADMIN_PASSWORD_HASH env: ${process.env.ADMIN_PASSWORD_HASH || '(not set)'}`);
    process.exit(0);
  } catch (err) {
    console.error('Error checking admin:', err.message || err);
    process.exit(1);
  }
};

run();
