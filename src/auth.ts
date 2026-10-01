import { Env } from './types';

export interface AuthResult {
  valid: boolean;
  error?: string;
}

export function authenticate(request: Request, env: Env): AuthResult {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return { valid: false, error: 'Unauthorized: Missing Authorization header' };
  }
  
  let key = authHeader;
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    key = authHeader.slice(7).trim();
  } else {
    key = authHeader.trim();
  }
  
  if (!env.SPDLY_CAPI_KEY) {
    // Fail closed if env key is missing
    return { valid: false, error: 'Internal Server Error: Authentication not configured' };
  }
  
  if (key !== env.SPDLY_CAPI_KEY) {
    return { valid: false, error: 'Unauthorized: Invalid API key' };
  }
  
  // Rate limiting placeholder
  // TODO: implement actual rate limiting using Cloudflare Rate Limiting or KV
  
  return { valid: true };
}
