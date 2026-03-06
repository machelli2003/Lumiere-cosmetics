const bcrypt = require('bcryptjs');

const pwd = process.argv[2] || process.env.PASSWORD;
if (!pwd) {
  console.error('Usage: node hashPassword.js <password> or set PASSWORD env var');
  process.exit(1);
}

bcrypt.hash(pwd, 12)
  .then(hash => {
    console.log(hash);
    process.exit(0);
  })
  .catch(err => {
    console.error('Hash error:', err.message || err);
    process.exit(1);
  });
