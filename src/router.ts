import { Env } from './types';
import { handleCORS, corsHeaders } from './cors';
import { authenticate } from './auth';
import { handleModels } from './api/models';
import { handleChat } from './api/chat';
import { handleHealth } from './api/health';
import { handlePlaygroundProxy } from './api/playground';

interface RouteMatch {
  handler: string;
  pattern: RegExp;
  requiresAuth: boolean;
}

const routes: RouteMatch[] = [
  { handler: 'health', pattern: /^\/v1\/health$/, requiresAuth: false },
  { handler: 'models', pattern: /^\/v1\/models$/, requiresAuth: true },
  { handler: 'chat', pattern: /^\/v1\/chat\/completions$/, requiresAuth: true },
  { handler: 'playground', pattern: /^\/v1\/playground\/(.*)$/, requiresAuth: true },
];

export async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response | null> {
  const url = new URL(request.url);

  // Handle CORS preflight
  const corsResponse = handleCORS(request, env);
  if (corsResponse) return corsResponse;

  // Only route API requests starting with /v1
  if (!url.pathname.startsWith('/v1')) {
    return null; // Fall through to static assets
  }

  // Match route
  let matchedRoute: RouteMatch | null = null;
  for (const route of routes) {
    if (route.pattern.test(url.pathname)) {
      matchedRoute = route;
      break;
    }
  }

  if (!matchedRoute) {
    return jsonResponse(
      { error: { message: 'Not found', type: 'invalid_request_error', code: 'not_found' } },
      404,
      corsHeaders(request, env)
    );
  }

  // Authenticate if required
  if (matchedRoute.requiresAuth) {
    const authResult = authenticate(request, env);
    if (!authResult.valid) {
      return jsonResponse(
        { error: { message: authResult.error || 'Unauthorized', type: 'auth_error', code: 'unauthorized' } },
        401,
        corsHeaders(request, env)
      );
    }
  }

  // Dispatch to handler
  switch (matchedRoute.handler) {
    case 'health':
      return handleHealth(request, env);
    case 'models':
      return handleModels(request, env);
    case 'chat':
      return handleChat(request, env);
    case 'playground':
      return handlePlaygroundProxy(request, env);
    default:
      return jsonResponse(
        { error: { message: 'Not found', type: 'invalid_request_error', code: 'not_found' } },
        404,
        corsHeaders(request, env)
      );
  }
}

function jsonResponse(body: any, status: number, headers?: Headers): Response {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (headers) {
    headers.forEach((value, key) => { h[key] = value; });
  }
  return new Response(JSON.stringify(body), { status, headers: h });
}
