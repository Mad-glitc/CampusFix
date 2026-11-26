import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import generateToken from './generateToken.js';
import { authorize } from '../middleware/roleMiddleware.js';

async function runAuthTests() {
  console.log('[Test] 1. Testing JWT Token Generation...');
  const sampleUserId = '65f123456789abcdef012345';
  const sampleRole = 'student';
  const token = generateToken(sampleUserId, sampleRole);
  
  if (!token) throw new Error('Token generation failed');
  const decoded = jwt.decode(token);
  if (decoded.id !== sampleUserId || decoded.role !== sampleRole) {
    throw new Error('Decoded token payload does not match');
  }
  console.log('✅ JWT token generated & verified:', token.substring(0, 25) + '...');

  console.log('[Test] 2. Testing Password Hashing & Verification...');
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const isMatch = await bcrypt.compare(password, hash);
  if (!isMatch) throw new Error('Bcrypt password verification failed');
  console.log('✅ Bcrypt hash & compare verified');

  console.log('[Test] 3. Testing RBAC Role Middleware Authorization...');
  const adminAuthorizer = authorize('admin');
  let allowed = false;
  let rejected = false;

  // Test admin user (should allow)
  const reqAdmin = { user: { role: 'admin' } };
  const resAdmin = {};
  adminAuthorizer(reqAdmin, resAdmin, () => { allowed = true; });

  // Test student user (should reject with 403)
  const reqStudent = { user: { role: 'student' } };
  const resStudent = {
    status: (code) => ({
      json: (data) => {
        if (code === 403) rejected = true;
      }
    })
  };
  adminAuthorizer(reqStudent, resStudent, () => {});

  if (!allowed || !rejected) {
    throw new Error('RBAC middleware verification failed');
  }
  console.log('✅ RBAC role middleware verified (admin allowed, student rejected with 403)');

  console.log('All Phase 3 Authentication & RBAC modules passed verification!');
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error('❌ Auth test error:', err);
  process.exit(1);
});
