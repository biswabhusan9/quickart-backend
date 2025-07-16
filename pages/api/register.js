import { users, hashPassword, signToken, COOKIE_NAME, setCorsHeaders } from './_utils';

export default function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, role, firstName, lastName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'User exists' });
  const newUser = {
    id: users.length + 1,
    email,
    password: hashPassword(password),
    role: role === 'admin' ? 'admin' : 'user',
    firstName: firstName || '',
    lastName: lastName || '',
  };
  users.push(newUser);
  const token = signToken(newUser);
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=None; Secure`);
  res.status(201).json({ id: newUser.id, email: newUser.email, role: newUser.role, firstName: newUser.firstName, lastName: newUser.lastName });
} 