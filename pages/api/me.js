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

import path from "path";
import formidable from "formidable";
import { promises as fsPromises } from "fs"; // ✅ Used to create directory

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  // ✅ Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), "public/uploads");
    form.keepExtensions = true;

    // Ensure directory exists
    await fsPromises.mkdir(form.uploadDir, { recursive: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: "File parsing error" });
      }

      const uploadedFile = files?.profile?.[0];
      if (!uploadedFile) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${path.basename(uploadedFile.filepath)}`;
      return res.status(200).json({ message: "Profile picture updated", url: fileUrl });
    });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong", error: e.message });
  }
}
