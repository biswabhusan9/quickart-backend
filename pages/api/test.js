import { setCorsHeaders } from './_utils';

export default function handler(req, res) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.status(200).json({ 
    message: 'Backend is working!',
    method: req.method,
    headers: req.headers,
    body: req.body
  });
} 