import { Env, ModelListResponse, ModelInfo } from '../types';
import { getProviderRegistry, getApiKeyForProvider } from '../routing/model-router';

let modelCache: ModelListResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function handleModels(request: Request, env: Env): Promise<Response> {
  const now = Date.now();
  if (modelCache && now - cacheTimestamp < CACHE_TTL) {
    return new Response(JSON.stringify(modelCache), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const providers = getProviderRegistry();
  const allModels: ModelInfo[] = [];

  const providerPromises = providers.map(async (provider) => {
    try {
      const apiKey = getApiKeyForProvider(provider, env);
      if (!apiKey) {
        return; // Skip providers without API keys
      }
      const models = await provider.listModels(apiKey);
      // Prefix models with provider ID
      const prefixedModels = models.map(m => ({
        ...m,
        id: `${provider.id}/${m.id}`,
        object: 'model' as const,
        created: Math.floor(Date.now() / 1000),
        owned_by: provider.id
      }));
      allModels.push(...prefixedModels);
    } catch (error) {
      console.warn(`Failed to list models for provider ${provider.id}:`, error);
      // Fail gracefully
    }
  });

  await Promise.allSettled(providerPromises);

  // Add aliases from env if configured
  // For now, we rely on the router for aliases, but we could list them here

  const response: ModelListResponse = {
    object: 'list',
    data: allModels,
  };

  modelCache = response;
  cacheTimestamp = now;

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
