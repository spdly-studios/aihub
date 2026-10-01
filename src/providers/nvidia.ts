import { BaseOpenAIProvider } from './base';

export class NvidiaProvider extends BaseOpenAIProvider {
  id = 'nvidia';
  name = 'NVIDIA NIM';

  constructor() {
    super('https://integrate.api.nvidia.com');
  }

  getApiKeyName(): string {
    return 'NVIDIA_API_KEY';
  }
}
