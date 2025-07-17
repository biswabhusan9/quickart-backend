// import { users, verifyToken, COOKIE_NAME, setCorsHeaders } from './_utils';
// import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req, res) {
//   // ✅ Step 1: Handle OPTIONS (preflight request)
//   if (req.method === 'OPTIONS') {
//     res.writeHead(200, {
//       'Access-Control-Allow-Origin': req.headers.origin || '*',
//       'Access-Control-Allow-Credentials': 'true',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     });
//     res.end();
//     return;
//   }

//   // ✅ Step 2: Set CORS for normal requests
//   setCorsHeaders(req, res);

//   // ✅ Step 3: Token validation
//   const cookie = req.headers.cookie || '';
//   const token = cookie.split('; ').find(c => c.startsWith(COOKIE_NAME + '='))?.split('=')[1];
//   if (!token) return res.status(401).json({ error: 'Not authenticated' });

//   const payload = verifyToken(token);
//   if (!payload) return res.status(401).json({ error: 'Invalid token' });

//   const user = users.find(u => u.id === payload.id);
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   // ✅ Step 4: PATCH request (with or without image)
//   if (req.method === 'PATCH') {
//     if (req.headers['content-type']?.includes('multipart/form-data')) {
//       const form = new formidable.IncomingForm();
//       form.uploadDir = path.join(process.cwd(), 'next-auth-api/public/profile-pics');
//       form.keepExtensions = true;

//       form.parse(req, (err, fields, files) => {
//         if (err) return res.status(500).json({ error: 'Image upload failed' });

//         if (fields.firstName) user.firstName = fields.firstName;
//         if (fields.lastName) user.lastName = fields.lastName;
//         if (fields.phone) user.phone = fields.phone;

//         if (files.profilePic) {
//           const file = files.profilePic;
//           const ext = path.extname(file.originalFilename || file.newFilename);
//           const newFilename = `user_${user.id}_${Date.now()}${ext}`;
//           const newPath = path.join(form.uploadDir, newFilename);
//           fs.renameSync(file.filepath, newPath);
//           user.profilePic = `/profile-pics/${newFilename}`;
//         }

//         if (fields.removeProfilePic === 'true' && user.profilePic) {
//           const oldPath = path.join(form.uploadDir, path.basename(user.profilePic));
//           if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//           user.profilePic = '';
//         }

//         return res.status(200).json({
//           id: user.id,
//           email: user.email,
//           role: user.role,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           phone: user.phone,
//           profilePic: user.profilePic || '',
//         });
//       });
//       return;
//     } else {
//       // Handle JSON PATCH update (no image)
//       const { firstName, lastName, phone, removeProfilePic } = req.body;
//       if (firstName) user.firstName = firstName;
//       if (lastName) user.lastName = lastName;
//       if (phone) user.phone = phone;
//       if (removeProfilePic === true && user.profilePic) {
//         const picPath = path.join(process.cwd(), 'next-auth-api/public/profile-pics', path.basename(user.profilePic));
//         if (fs.existsSync(picPath)) fs.unlinkSync(picPath);
//         user.profilePic = '';
//       }

//       return res.status(200).json({
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phone: user.phone,
//         profilePic: user.profilePic || '',
//       });
//     }
//   }

//   // ✅ GET user profile
//   return res.status(200).json({
//     id: user.id,
//     email: user.email,
//     role: user.role,
//     firstName: user.firstName,
//     lastName: user.lastName,
//     phone: user.phone,
//     profilePic: user.profilePic || '',
//   });
// }

import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { users } from './data'; // Replace with DB in production

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: Parse form with file
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  // ✅ Fix CORS headers
  const allowedOrigin = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : 'https://quickart-frontend.vercel.app'; // update if needed
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight
  }

  // 🛡️ Auth: Extract token
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not logged in' });

  let decoded;
  try {
    decoded = jwt.verify(token, 'your-secret-key');
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const user = users.find(u => u.id === decoded.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (req.method === 'GET') {
    return res.status(200).json({ user });
  }

  if (req.method === 'PATCH') {
    try {
      const { fields, files } = await parseForm(req);

      if (fields.firstName) user.firstName = fields.firstName;
      if (fields.lastName) user.lastName = fields.lastName;
      if (fields.phoneNumber) user.phoneNumber = fields.phoneNumber;

      if (files.profilePic) {
        const file = files.profilePic[0];
        user.profilePic = `/uploads/${path.basename(file.filepath)}`;
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Update error:', error);
      return res.status(500).json({ message: 'Failed to update profile.' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
