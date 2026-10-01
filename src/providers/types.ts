export interface ProviderAdapter {
  id: string;
  name: string;
  // Fetch available models from the provider
  listModels(apiKey: string): Promise<ProviderModel[]>;
  // Send a chat completion request
  chatCompletion(request: ProviderChatRequest): Promise<Response>;
  // Check if this provider supports a given model
  supportsModel(modelId: string): boolean;
  // Get the API key env var name
  getApiKeyName(): string;
}

export interface ProviderModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  supportsStreaming: boolean;
  supportsVision?: boolean;
  supportsTools?: boolean;
}

export interface ProviderChatRequest {
  apiKey: string;
  model: string;
  messages: Array<{role: string; content: any}>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  stop?: string | string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  seed?: number;
  signal?: AbortSignal;
}

export interface ProviderResponse {
  response: Response;
  provider: string;
  model: string;
  latency: number;
}
