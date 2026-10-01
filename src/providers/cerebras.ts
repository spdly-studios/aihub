import { BaseOpenAIProvider } from './base';

export class CerebrasProvider extends BaseOpenAIProvider {
  id = 'cerebras';
  name = 'Cerebras';

  constructor() {
    super('https://api.cerebras.ai');
  }

  getApiKeyName(): string {
    return 'CEREBRAS_API_KEY';
  }
}
