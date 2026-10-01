import { Env } from './types';
import { handleRequest } from './router';
import { generateRequestId, validateRequestSize } from './security';
import { corsHeaders } from './cors';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    // Check request body size
    if (!await validateRequestSize(request)) {
      return new Response(JSON.stringify({
        error: { message: 'Payload too large', type: 'request_error', code: 'payload_too_large' }
      }), {
        status: 413,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...Object.fromEntries(corsHeaders(request, env))
        }
      });
    }

    try {
      // Route request
      let response = await handleRequest(request, env, ctx);
      
      // If router returned null, let Workers Static Assets handle it
      if (response === null) {
        return undefined as any; 
      }
      
      // Append global headers to response
      const newHeaders = new Headers(response.headers);
      const cors = corsHeaders(request, env);
      cors.forEach((value, key) => {
        if (!newHeaders.has(key)) {
          newHeaders.set(key, value);
        }
      });
      newHeaders.set('X-Request-ID', requestId);
      newHeaders.set('X-Response-Time', `${Date.now() - startTime}ms`);
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      console.error(`[${requestId}] Unhandled error:`, error);
      return new Response(JSON.stringify({
        error: { message: 'Internal Server Error', type: 'server_error', code: 'internal_error' }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...Object.fromEntries(corsHeaders(request, env))
        }
      });
    }
  }
};
