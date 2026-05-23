import { next } from '@vercel/edge';

const ALLOWED_EMAIL = 'joseamijarespg@gmail.com';
const PUBLIC_PATHS = ['/api/callback', '/favicon.ico'];

export default async function middleware(req) {
  const url = new URL(req.url);
  
  // Allow public paths
  if (PUBLIC_PATHS.some(p => url.pathname.startsWith(p))) {
    return next();
  }
  
  // Check session cookie
  const cookie = req.headers.get('cookie') || '';
  const sessionMatch = cookie.match(/vox_session=([^;]+)/);
  
  if (sessionMatch) {
    try {
      const session = JSON.parse(atob(sessionMatch[1]));
      if (session.email === ALLOWED_EMAIL && session.expires > Date.now()) {
        return next();
      }
    } catch (e) {
      // Invalid session
    }
  }
  
  // Redirect to Google OAuth
  const redirectUri = `${url.origin}/api/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid%20email` +
    `&prompt=select_account`;
  
  return Response.redirect(googleAuthUrl, 302);
}

export const config = {
  matcher: ['/((?!api/callback).*)'],
};
