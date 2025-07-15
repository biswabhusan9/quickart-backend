import { users, hashPassword, signToken, COOKIE_NAME } from '../../../pages/api/_utils';

export async function POST(req) {
  const body = await req.json();
  const { email, password, role } = body;
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (users.find(u => u.email === email)) {
    return new Response(JSON.stringify({ error: 'User exists' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const newUser = {
    id: users.length + 1,
    email,
    password: hashPassword(password),
    role: role === 'admin' ? 'admin' : 'user',
  };
  users.push(newUser);
  const token = signToken(newUser);
  return new Response(
    JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }),
    {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=None; Secure`,
      },
    }
  );
} 