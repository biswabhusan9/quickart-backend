import { users, verifyToken, COOKIE_NAME, setCorsHeaders } from './_utils';

export default function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  const cookie = req.headers.cookie || '';
  const token = cookie.split('; ').find(c => c.startsWith(COOKIE_NAME + '='))?.split('=')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const user = users.find(u => u.id === payload.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json({ message: 'Welcome, admin!', user: { id: user.id, email: user.email, role: user.role } });
} 