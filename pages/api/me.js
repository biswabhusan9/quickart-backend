import { users, verifyToken, COOKIE_NAME, setCorsHeaders } from './_utils';

export default async function handler(req, res) {
  console.log('API /me called with method:', req.method);
  console.log('Request headers:', req.headers);
  
  // Handle OPTIONS (preflight request)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.writeHead(200, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Set CORS for normal requests
  setCorsHeaders(req, res);

  // Only allow GET and PATCH methods
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed', method: req.method });
  }

  // Token validation
  const cookie = req.headers.cookie || '';
  console.log('Cookie:', cookie);
  const token = cookie.split('; ').find(c => c.startsWith(COOKIE_NAME + '='))?.split('=')[1];
  console.log('Token:', token);
  
  if (!token) {
    console.log('No token found');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const payload = verifyToken(token);
  console.log('Payload:', payload);
  
  if (!payload) {
    console.log('Invalid token');
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = users.find(u => u.id === payload.id);
  console.log('User found:', user);
  
  if (!user) {
    console.log('User not found');
    return res.status(404).json({ error: 'User not found' });
  }

  // PATCH request (profile update)
  if (req.method === 'PATCH') {
    console.log('PATCH request body:', req.body);
    try {
      const { firstName, lastName, phone, email } = req.body;
      
      // Update user fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (email !== undefined) user.email = email;

      console.log('Updated user:', user);

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
      console.error('Error handling PATCH request:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }

  // GET request (user profile)
  if (req.method === 'GET') {
    console.log('GET request - returning user:', user);
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
}
