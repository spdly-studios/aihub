import { ProviderAdapter, ProviderChatRequest, ProviderModel } from './types';

export abstract class BaseOpenAIProvider implements ProviderAdapter {
  abstract id: string;
  abstract name: string;
  
  protected baseUrl: string;
  protected chatPath: string = '/v1/chat/completions';
  protected modelsPath: string = '/v1/models';
  protected timeoutMs: number = 60000;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  abstract getApiKeyName(): string;

  protected getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
  }

  async listModels(apiKey: string): Promise<ProviderModel[]> {
    const response = await fetch(`${this.baseUrl}${this.modelsPath}`, {
      headers: this.getHeaders(apiKey),
    });

    if (!response.ok) {
      throw new Error(`${this.name} API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return (data.data || []).map((model: any) => ({
      id: model.id,
      name: model.id,
      provider: this.id,
      supportsStreaming: true,
    }));
  }

  async chatCompletion(request: ProviderChatRequest): Promise<Response> {
    const { apiKey, signal, ...body } = request;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const combinedSignal = signal ? this.combineSignals(signal, controller.signal) : controller.signal;

    try {
      const response = await fetch(`${this.baseUrl}${this.chatPath}`, {
        method: 'POST',
        headers: this.getHeaders(apiKey),
        body: JSON.stringify(body),
        signal: combinedSignal
      });

      if (!response.ok) {
        throw new Error(`${this.name} API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  supportsModel(modelId: string): boolean {
    return true; // Optionally implement model support checking
  }

  private combineSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (signal1.aborted) onAbort();
    if (signal2.aborted) onAbort();
    signal1.addEventListener('abort', onAbort);
    signal2.addEventListener('abort', onAbort);
    return controller.signal;
  }
}
