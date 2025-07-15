import { users, comparePassword, signToken, COOKIE_NAME } from '../../../pages/api/_utils';

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;
  const user = users.find(u => u.email === email);
  if (!user || !comparePassword(password, user.password)) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const token = signToken(user);
  return new Response(
    JSON.stringify({ id: user.id, email: user.email, role: user.role }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=None; Secure`,
      },
    }
  );
} 