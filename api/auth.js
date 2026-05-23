// Vercel Edge Function — Gmail-only auth
export const config = {
  runtime: 'edge',
};

const ALLOWED_EMAIL = 'joseamijarespg@gmail.com';

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Check for session cookie
  const cookie = req.headers.get('cookie') || '';
  const sessionMatch = cookie.match(/vox_session=([^;]+)/);
  
  if (sessionMatch) {
    try {
      const session = JSON.parse(atob(sessionMatch[1]));
      if (session.email === ALLOWED_EMAIL && session.expires > Date.now()) {
        // Valid session — allow through
        return fetch(req);
      }
    } catch (e) {
      // Invalid session
    }
  }
  
  // No valid session — redirect to Google OAuth
  const redirectUri = `${url.origin}/api/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid%20email` +
    `&prompt=select_account`;
  
  return Response.redirect(googleAuthUrl, 302);
}
