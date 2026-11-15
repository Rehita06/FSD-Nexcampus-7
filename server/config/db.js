const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy server/.env.example to server/.env and add your MongoDB connection string.',
    );
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
