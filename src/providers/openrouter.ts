import { BaseOpenAIProvider } from './base';

export class OpenRouterProvider extends BaseOpenAIProvider {
  id = 'openrouter';
  name = 'OpenRouter';

  constructor() {
    super('https://openrouter.ai/api');
  }

  getApiKeyName(): string {
    return 'OPENROUTER_API_KEY';
  }

  protected getHeaders(apiKey: string): Record<string, string> {
    return {
      ...super.getHeaders(apiKey),
      'HTTP-Referer': 'https://ai.spdly.eu.cc',
      'X-Title': 'SPDLY AI'
    };
  }
}
