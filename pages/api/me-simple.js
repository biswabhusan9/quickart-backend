import { users, verifyToken, COOKIE_NAME, setCorsHeaders } from './_utils';

export default async function handler(req, res) {
  console.log('Simple /me API called with method:', req.method);
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  setCorsHeaders(req, res);

  // Simple token validation
  const cookie = req.headers.cookie || '';
  const token = cookie.split('; ').find(c => c.startsWith(COOKIE_NAME + '='))?.split('=')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = users.find(u => u.id === payload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // PATCH request
  if (req.method === 'PATCH') {
    try {
      const { firstName, lastName, phone, email } = req.body;
      
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (email !== undefined) user.email = email;

      return res.status(200).json({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profilePic: user.profilePic || '',
      });
    } catch (err) {
      console.error('PATCH error:', err);
      return res.status(500).json({ error: 'Update failed', details: err.message });
    }
  }

  // GET request
  return res.status(200).json({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    profilePic: user.profilePic || '',
  });
} 