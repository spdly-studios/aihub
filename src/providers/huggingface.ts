import { BaseOpenAIProvider } from './base';
import { ProviderModel } from './types';

export class HuggingFaceProvider extends BaseOpenAIProvider {
  id = 'huggingface';
  name = 'Hugging Face';

  constructor() {
    super('https://api-inference.huggingface.co');
  }

  getApiKeyName(): string {
    return 'HUGGINGFACE_API_KEY';
  }

  async listModels(apiKey: string): Promise<ProviderModel[]> {
    // Hugging Face doesn't have a simple inference model list API matching our format
    return [
      {
        id: 'meta-llama/Llama-2-7b-chat-hf',
        name: 'Llama-2-7b-chat-hf',
        provider: this.id,
        supportsStreaming: true,
      },
      {
        id: 'mistralai/Mistral-7B-Instruct-v0.2',
        name: 'Mistral-7B-Instruct-v0.2',
        provider: this.id,
        supportsStreaming: true,
      }
    ];
  }
}
