// Environment bindings
export interface Env {
  SPDLY_CAPI_KEY: string;
  NVIDIA_API_KEY: string;
  CEREBRAS_API_KEY: string;
  GOOGLE_API_KEY: string;
  OPENROUTER_API_KEY: string;
  NARAROUTER_API_KEY: string;
  HUGGINGFACE_API_KEY: string;
  ENVIRONMENT: string;
}

// Chat completion request (OpenAI-compatible)
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  stop?: string | string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  seed?: number;
  n?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string; detail?: string };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

// Chat completion response
export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Choice[];
  usage?: Usage;
  system_fingerprint?: string;
}

export interface Choice {
  index: number;
  message: ChatMessage;
  finish_reason: string | null;
  logprobs?: any;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Streaming
export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: StreamChoice[];
  usage?: Usage;
}

export interface StreamChoice {
  index: number;
  delta: Partial<ChatMessage>;
  finish_reason: string | null;
}

// Model listing
export interface ModelInfo {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  provider?: string;
}

export interface ModelListResponse {
  object: 'list';
  data: ModelInfo[];
}

// Provider definition
export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'bearer' | 'api-key-header' | 'api-key-query' | 'basic' | 'custom' | 'none';
  authHeader?: string;
  modelsPath?: string;
  chatPath?: string;
  streaming: boolean;
  enabled: boolean;
}

// Error response
export interface ApiError {
  error: {
    message: string;
    type: string;
    code: string;
    param?: string;
  };
}

// Request context
export interface RequestContext {
  requestId: string;
  startTime: number;
  provider?: string;
  model?: string;
}
