import { users, comparePassword, signToken, COOKIE_NAME, setCorsHeaders } from './_utils';

export default function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken(user);
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=None; Secure`);
  res.status(200).json({ id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName });
} 