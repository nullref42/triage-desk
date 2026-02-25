import { Context, Next } from 'hono';

export interface Env {
  DB: D1Database;
}

export function getUser(c: Context): string {
  // Try CF Access JWT
  const jwt = c.req.header('Cf-Access-Jwt-Assertion');
  if (jwt) {
    try {
      // Decode payload (not verifying here — CF Access already verified)
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload.email || payload.sub || 'unknown';
    } catch {
      return 'unknown';
    }
  }
  return 'anonymous';
}

export function isServiceToken(c: Context): boolean {
  return !!c.req.header('CF-Access-Client-Id');
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  // For now, allow all requests (CF Access handles auth at the edge)
  // Add stricter checks here when needed
  await next();
}

export async function serviceTokenAuth(c: Context<{ Bindings: Env }>, next: Next) {
  // /api/scan/results — allow service tokens, JWT, or any authenticated request
  // When Cloudflare Access is set up, this will be properly gated at the edge
  await next();
}
