import { users, verifyToken, COOKIE_NAME, setCorsHeaders } from './_utils';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ✅ Always set CORS headers
  setCorsHeaders(req, res);

  // ✅ Respond to preflight request properly
  if (req.method === 'OPTIONS') {
    res.status(200).end(); // ✅ This is now allowed
    return;
  }

  // ✅ Token check
  const cookie = req.headers.cookie || '';
  const token = cookie.split('; ').find(c => c.startsWith(COOKIE_NAME + '='))?.split('=')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const user = users.find(u => u.id === payload.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // ✅ PATCH = update user profile
  if (req.method === 'PATCH') {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      const form = new formidable.IncomingForm();
      form.uploadDir = path.join(process.cwd(), 'next-auth-api/public/profile-pics');
      form.keepExtensions = true;

      form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ error: 'Image upload failed' });

        if (fields.firstName) user.firstName = fields.firstName;
        if (fields.lastName) user.lastName = fields.lastName;
        if (fields.phone) user.phone = fields.phone;

        if (files.profilePic) {
          const file = files.profilePic;
          const ext = path.extname(file.originalFilename || file.newFilename);
          const newFilename = `user_${user.id}_${Date.now()}${ext}`;
          const newPath = path.join(form.uploadDir, newFilename);
          fs.renameSync(file.filepath, newPath);
          user.profilePic = `/profile-pics/${newFilename}`;
        }

        if (fields.removeProfilePic === 'true' && user.profilePic) {
          const oldPath = path.join(form.uploadDir, path.basename(user.profilePic));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          user.profilePic = '';
        }

        return res.status(200).json({
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profilePic: user.profilePic || '',
        });
      });
      return;
    } else {
      // Handle JSON body
      const { firstName, lastName, phone, removeProfilePic } = req.body;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (removeProfilePic === true && user.profilePic) {
        const picPath = path.join(process.cwd(), 'next-auth-api/public/profile-pics', path.basename(user.profilePic));
        if (fs.existsSync(picPath)) fs.unlinkSync(picPath);
        user.profilePic = '';
      }

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

  // GET profile
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
