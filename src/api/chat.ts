import { Env, ChatCompletionRequest, ApiError } from '../types';
import { resolveModel } from '../routing/model-router';
import { handleFailover } from '../routing/failover';

export async function handleChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed', type: 'invalid_request_error' } }), { status: 405 });
  }

  let body: ChatCompletionRequest;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: 'Invalid JSON', type: 'invalid_request_error' } }), { status: 400 });
  }

  if (!body.model) {
    return new Response(JSON.stringify({ error: { message: 'Model is required', type: 'invalid_request_error' } }), { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: { message: 'Messages array is required and must not be empty', type: 'invalid_request_error' } }), { status: 400 });
  }

  try {
    const { provider, actualModel, apiKey } = resolveModel(body.model, env);
    body.model = actualModel; // Update request to use the actual model ID expected by provider

    const startTime = Date.now();
    
    // Call failover router
    const response = await handleFailover(body, provider, apiKey, env, request.signal);
    
    const duration = Date.now() - startTime;

    // We need to return a new response to append headers if it's already a response
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('X-Provider', provider.id);
    newResponse.headers.set('X-Model', actualModel);
    newResponse.headers.set('X-Request-Duration', duration.toString());
    
    // Pass through content-type
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
        newResponse.headers.set('Content-Type', contentType);
    }

    return newResponse;

  } catch (error: any) {
    const status = error.status || 500;
    const apiError: ApiError = {
      error: {
        message: error.message || 'Internal Server Error',
        type: error.type || 'server_error',
        code: error.code || 'internal_error'
      }
    };
    return new Response(JSON.stringify(apiError), { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
