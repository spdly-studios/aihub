import { Env, ChatCompletionRequest } from '../types';
import { ProviderAdapter, ProviderChatRequest } from '../providers/types';

const MAX_RETRIES = 3;

export async function handleFailover(
    request: ChatCompletionRequest,
    primaryProvider: ProviderAdapter,
    primaryApiKey: string,
    env: Env,
    signal?: AbortSignal
): Promise<Response> {
    let attempts = 0;
    let lastError: any = null;

    // Build the provider-level request from the OpenAI-compatible request
    const providerRequest: ProviderChatRequest = {
        apiKey: primaryApiKey,
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        top_p: request.top_p,
        max_tokens: request.max_tokens,
        stream: request.stream,
        stop: request.stop,
        frequency_penalty: request.frequency_penalty,
        presence_penalty: request.presence_penalty,
        seed: request.seed,
        signal,
    };

    // Currently retry the primary provider.
    // Future: look up alternative providers from failover chain configuration.
    const providersToTry = [{ provider: primaryProvider, request: providerRequest }];

    for (const { provider, request: provReq } of providersToTry) {
        while (attempts < MAX_RETRIES) {
            attempts++;
            try {
                const response = await provider.chatCompletion(provReq);

                // If 5xx or rate limit, retry (don't retry 4xx client errors)
                if (response.status >= 500 || response.status === 429) {
                    lastError = new Error(`Provider returned ${response.status}`);
                    if (attempts >= MAX_RETRIES) break;
                    // Brief backoff before retry
                    await new Promise(r => setTimeout(r, Math.min(1000 * attempts, 3000)));
                    continue;
                }

                // Success or 4xx (client error - don't retry)
                return response;

            } catch (error: any) {
                lastError = error;
                // Client aborted - don't retry
                if (signal?.aborted) {
                    throw error;
                }
                // Network errors - try again
                if (attempts >= MAX_RETRIES) break;
                await new Promise(r => setTimeout(r, Math.min(1000 * attempts, 3000)));
            }
        }
    }

    throw {
        status: 502,
        message: `All providers failed after ${attempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`,
        type: 'gateway_error',
        code: 'provider_unavailable'
    };
}
