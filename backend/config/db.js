const mongoose = require('mongoose');

// Try to connect to provided MONGO_URI; on invalid URI, fall back to an in-memory MongoDB (useful for local dev/testing)
const connectDB = async () => {
    const opts = { serverSelectionTimeoutMS: 5000 };

    const connect = async (uri) => {
        const conn = await mongoose.connect(uri, opts);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    };

    const isValidMongoUri = (uri) => typeof uri === 'string' && /^mongodb(\+srv)?:\/\//.test(uri);

    try {
        let uri = process.env.MONGO_URI;

        if (!uri || !isValidMongoUri(uri)) {
            if (uri) console.warn(`❌ MongoDB URI appears invalid: ${uri}`);
            else console.warn('❌ MONGO_URI is not set.');

            console.warn('Attempting to start an in-memory MongoDB for development/testing...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
                process.env.MONGO_URI = uri;
                await connect(uri);
                console.log('✅ In-memory MongoDB started for development');
                return;
            } catch (memErr) {
                console.error(`❌ Failed to start in-memory MongoDB: ${memErr.message}`);
                throw memErr;
            }
        }

        // At this point uri is valid
        await connect(uri);
        return;
    } catch (err) {
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;