import { Env } from './types';

const ALLOWED_ORIGINS = ['https://ai.spdly.eu.cc', 'http://localhost', 'http://127.0.0.1'];

export function corsHeaders(request: Request, env?: Env): Headers {
  const origin = request.headers.get('Origin') || '';
  const headers = new Headers();
  
  // Check if origin is allowed or if it's a localhost with port
  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed)) || origin === '*';
  
  headers.set('Access-Control-Allow-Origin', isAllowed && origin ? origin : '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  headers.set('Access-Control-Max-Age', '86400');
  
  return headers;
}

export function handleCORS(request: Request, env?: Env): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request, env),
    });
  }
  return null;
}
