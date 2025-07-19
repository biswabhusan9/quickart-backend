import { users, setCorsHeaders } from './_utils';

export default function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Return list of users (without passwords for security)
  const userList = users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  }));
  
  return res.status(200).json({ 
    users: userList,
    total: userList.length
  });
} 