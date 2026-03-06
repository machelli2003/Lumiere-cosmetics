require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const uri = process.env.MONGO_URI;
const email = process.env.ADMIN_EMAIL || 'admin@lumiere.com';
const hash = process.env.ADMIN_PASSWORD_HASH;

if (!uri) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(uri);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('No user found with that email, creating one.');
      const data = { firstName: 'Lumiere', lastName: 'Admin', email, role: 'admin', isEmailVerified: true };
      if (hash) data.password = hash;
      else if (process.env.ADMIN_PASSWORD_PLAIN) data.password = process.env.ADMIN_PASSWORD_PLAIN;
      const created = await User.create(data);
      console.log('Created user:', created.email, 'role:', created.role);
      process.exit(0);
    }

    const updates = { role: 'admin', isEmailVerified: true };
    if (hash) updates.password = hash;

    await User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
    console.log('Updated user to admin:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error ensuring admin:', err.message || err);
    process.exit(1);
  }
};

run();
