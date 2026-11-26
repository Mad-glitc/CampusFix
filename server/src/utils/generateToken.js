import jwt from 'jsonwebtoken';

/**
 * Signs a JSON Web Token containing the user ID and role
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'campusfix_jwt_super_secret_key_2026_int252_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export default generateToken;
