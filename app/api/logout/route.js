import { COOKIE_NAME } from '../../../pages/api/_utils';

export async function POST() {
  // Clear the cookie
  return new Response(JSON.stringify({ message: 'Logged out' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure`,
    },
  });
} 