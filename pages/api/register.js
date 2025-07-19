import { users, hashPassword, signToken, COOKIE_NAME, setCorsHeaders } from './_utils';

export default function handler(req, res) {
  console.log('Register API called');
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') return res.status(405).end();
  
  const { email, password, role, firstName, lastName } = req.body;
  console.log('Register attempt for:', { email, firstName, lastName, role });
  
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'User exists' });
  
  const newUser = {
    id: users.length + 1,
    email,
    password: hashPassword(password),
    role: role === 'admin' ? 'admin' : 'user',
    firstName: firstName || '',
    lastName: lastName || '',
    phone: '',
    profilePic: '',
  };
  
  users.push(newUser);
  console.log('New user created:', { id: newUser.id, email: newUser.email });
  
  const token = signToken(newUser);
  console.log('Token generated for new user:', token);
  
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
  res.status(201).json({ 
    id: newUser.id, 
    email: newUser.email, 
    role: newUser.role, 
    firstName: newUser.firstName, 
    lastName: newUser.lastName 
  });
} 