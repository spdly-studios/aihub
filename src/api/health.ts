import { Env } from '../types';

export async function handleHealth(request: Request, env: Env): Promise<Response> {
  const providers = {
    nvidia: env.NVIDIA_API_KEY ? 'configured' : 'not_configured',
    cerebras: env.CEREBRAS_API_KEY ? 'configured' : 'not_configured',
    google: env.GOOGLE_API_KEY ? 'configured' : 'not_configured',
    openrouter: env.OPENROUTER_API_KEY ? 'configured' : 'not_configured',
    nararouter: env.NARAROUTER_API_KEY ? 'configured' : 'not_configured',
    huggingface: env.HUGGINGFACE_API_KEY ? 'configured' : 'not_configured',
  };

  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    providers
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
