import { Env } from '../types';

const ALLOWED_DOMAINS = [
    'api.nvidia.com',
    'api.cerebras.ai',
    'generativelanguage.googleapis.com',
    'openrouter.ai',
    'api.nara.ai',
    'api-inference.huggingface.co'
];

export async function handlePlaygroundProxy(request: Request, env: Env): Promise<Response> {
  // Simplistic auth check
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.SPDLY_CAPI_KEY}`) {
      // Allow proceeding without auth if secret not configured, or enforce it?
      if (env.SPDLY_CAPI_KEY) {
        return new Response('Unauthorized', { status: 401 });
      }
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { url, method = 'GET', headers = {}, body, timeout = 30000 } = await request.json<any>();

    if (!url) {
        return new Response('URL is required', { status: 400 });
    }

    try {
        const parsedUrl = new URL(url);
        if (!ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain))) {
            return new Response('URL domain not allowed', { status: 403 });
        }
    } catch (e) {
        return new Response('Invalid URL', { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const proxyRequest = new Request(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
    });

    const response = await fetch(proxyRequest);
    clearTimeout(timeoutId);

    const newResponse = new Response(response.body, response);
    // Strip sensitive headers
    newResponse.headers.delete('set-cookie');
    
    // Add CORS
    newResponse.headers.set('Access-Control-Allow-Origin', '*');

    return newResponse;

  } catch (error: any) {
    if (error.name === 'AbortError') {
        return new Response('Gateway Timeout', { status: 504 });
    }
    return new Response(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
