// Vercel Edge Function — Google OAuth callback
export const config = {
  runtime: 'edge',
};

const ALLOWED_EMAIL = 'joseamijarespg@gmail.com';

export default async function handler(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('No code provided', { status: 400 });
  }
  
  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/api/callback`,
      grant_type: 'authorization_code',
    }),
  });
  
  const tokens = await tokenRes.json();
  
  if (!tokens.id_token) {
    return new Response('Auth failed', { status: 401 });
  }
  
  // Decode ID token (JWT) to get email
  const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
  const email = payload.email;
  
  if (email !== ALLOWED_EMAIL) {
    return new Response(`Access denied for ${email}`, { status: 403 });
  }
  
  // Set session cookie
  const session = btoa(JSON.stringify({
    email,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }));
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': `vox_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
    },
  });
}
