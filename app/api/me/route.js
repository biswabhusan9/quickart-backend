import { users, verifyToken, COOKIE_NAME } from '../../../pages/api/_utils';

export async function GET(req) {
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split('; ').find(c => c.startsWith(COOKIE_NAME + '='))?.split('=')[1];
  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const user = users.find(u => u.id === payload.id);
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ id: user.id, email: user.email, role: user.role }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
} 