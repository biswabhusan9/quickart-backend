export default function handler(req, res) {
  console.log('Test endpoint called with method:', req.method);
  
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

  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle different methods
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ 
        message: 'GET request successful',
        method: req.method,
        timestamp: new Date().toISOString()
      });
    
    case 'PATCH':
      return res.status(200).json({ 
        message: 'PATCH request successful',
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
      });
    
    default:
      return res.status(405).json({ 
        error: 'Method not allowed',
        method: req.method,
        allowedMethods: ['GET', 'PATCH', 'OPTIONS']
      });
  }
} 