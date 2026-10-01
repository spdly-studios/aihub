import { BaseOpenAIProvider } from './base';

export class NaraRouterProvider extends BaseOpenAIProvider {
  id = 'nararouter';
  name = 'NaraRouter';

  constructor() {
    super('https://api.nararouter.dev');
  }

  getApiKeyName(): string {
    return 'NARAROUTER_API_KEY';
  }
}
