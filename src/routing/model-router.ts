import { Env } from '../types';
import { ProviderAdapter } from '../providers/types';
import { NvidiaProvider } from '../providers/nvidia';
import { CerebrasProvider } from '../providers/cerebras';
import { GoogleProvider } from '../providers/google';
import { OpenRouterProvider } from '../providers/openrouter';
import { NaraRouterProvider } from '../providers/nararouter';
import { HuggingFaceProvider } from '../providers/huggingface';

const DEFAULT_ALIASES: Record<string, string> = {
  'general': 'openrouter/meta-llama/llama-3.1-70b-instruct',
  'fast': 'cerebras/llama3.1-8b',
  'coding': 'cerebras/llama-3.3-70b',
  'reasoning': 'openrouter/anthropic/claude-3.5-sonnet',
  'vision': 'google/gemini-1.5-flash',
};

const registry: ProviderAdapter[] = [
    new NvidiaProvider(),
    new CerebrasProvider(),
    new GoogleProvider(),
    new OpenRouterProvider(),
    new NaraRouterProvider(),
    new HuggingFaceProvider()
];

export function getProviderRegistry(): ProviderAdapter[] {
    return registry;
}

export function getProviderForModel(modelId: string): ProviderAdapter | null {
    const providerId = modelId.split('/')[0];
    return registry.find(p => p.id === providerId) || null;
}

export function getApiKeyForProvider(provider: ProviderAdapter, env: Env): string {
    const keyMap: Record<string, string | undefined> = {
        'nvidia': env.NVIDIA_API_KEY,
        'cerebras': env.CEREBRAS_API_KEY,
        'google': env.GOOGLE_API_KEY,
        'openrouter': env.OPENROUTER_API_KEY,
        'nararouter': env.NARAROUTER_API_KEY,
        'huggingface': env.HUGGINGFACE_API_KEY
    };
    return keyMap[provider.id] || '';
}

export function resolveModel(modelId: string, env: Env): { provider: ProviderAdapter, actualModel: string, apiKey: string } {
    let resolvedId = modelId;

    // Check aliases
    if (DEFAULT_ALIASES[modelId]) {
        resolvedId = DEFAULT_ALIASES[modelId];
    }

    const provider = getProviderForModel(resolvedId);
    if (!provider) {
        throw { status: 400, message: `Unknown provider for model: ${resolvedId}` };
    }

    const actualModel = resolvedId.split('/').slice(1).join('/');
    if (!actualModel) {
        throw { status: 400, message: `Invalid model ID format: ${resolvedId}` };
    }

    const apiKey = getApiKeyForProvider(provider, env);
    if (!apiKey) {
        throw { status: 500, message: `API key not configured for provider: ${provider.id}` };
    }

    return { provider, actualModel, apiKey };
}
