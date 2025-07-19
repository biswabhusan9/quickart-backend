import { users, comparePassword, signToken, COOKIE_NAME, setCorsHeaders } from './_utils';

export default function handler(req, res) {
  console.log('Login API called');
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') return res.status(405).end();
  
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);
  console.log('Available users:', users.map(u => ({ id: u.id, email: u.email })));
  
  const user = users.find(u => u.email === email);
  console.log('User found:', user ? { id: user.id, email: user.email } : 'Not found');
  
  if (!user || !comparePassword(password, user.password)) {
    console.log('Authentication failed');
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = signToken(user);
  console.log('Token generated:', token);
  
  // Fix cookie settings for cross-origin requests
  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=None',
    'Secure',
    'Max-Age=86400' // 1 day
  ].join('; ');
  
  res.setHeader('Set-Cookie', cookieOptions);
  res.status(200).json({ 
    id: user.id, 
    email: user.email, 
    role: user.role, 
    firstName: user.firstName, 
    lastName: user.lastName 
  });
} 