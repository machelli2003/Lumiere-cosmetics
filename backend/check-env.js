require('dotenv').config();
console.log('MONGO_URI is set:', !!process.env.MONGO_URI);
console.log('MONGODB_URI is set:', !!process.env.MONGODB_URI);
if (process.env.MONGO_URI) {
    console.log('Prefix:', process.env.MONGO_URI.substring(0, 20));
}
