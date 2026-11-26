import mongoose from 'mongoose';

/**
 * MongoDB connection manager with resilient reconnection listeners
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusfix', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database Notice] Please ensure MongoDB is running or configure MONGODB_URI in server/.env (e.g. MongoDB Atlas)`);
    // Do not crash the entire server process so developers can inspect and seed when DB is ready
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[Database] MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected');
});

export default connectDB;
