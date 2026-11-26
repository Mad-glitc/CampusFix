import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkIndexes() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusfix');
  const collection = mongoose.connection.collection('users');
  const indexes = await collection.indexes();
  console.log('USERS INDEXES:', JSON.stringify(indexes, null, 2));
  await mongoose.disconnect();
}

checkIndexes().catch(console.error);
