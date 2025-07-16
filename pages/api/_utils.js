// Mock database (in-memory array)
export const users = [
  // Example admin user - password: adminpass
  {
    id: 1,
    email: 'admin@biswa.com',
    password: '$2b$10$wNu/mkhgiW3eGlybwByyeuNzOs9VIx7TQ7lBJ7/MDh2IlJ1B43WK2', // 'adminpass' hashed with bcryptjs
    role: 'admin',
  },
];

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = 'supersecretkey'; // Use env var in production
const COOKIE_NAME = 'token';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// For debugging: log password comparison
export function comparePassword(password, hash) {
  const result = bcrypt.compareSync(password, hash);
  console.log('Comparing password:', password, 'with hash:', hash, '=>', result);
  return result;
}

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function setCorsHeaders(req, res) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'https://quickart-murex.vercel.app',
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
}

export { COOKIE_NAME };