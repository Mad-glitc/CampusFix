import connectDB from '../server/src/config/db.js';
import app from '../server/src/app.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Vercel Serverless DB Notice]:', err.message);
  }
  return app(req, res);
}
