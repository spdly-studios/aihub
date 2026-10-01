import { ProviderAdapter, ProviderChatRequest, ProviderModel } from './types';

export class GoogleProvider implements ProviderAdapter {
  id = 'google';
  name = 'Google AI Studio';
  private baseUrl = 'https://generativelanguage.googleapis.com';

  getApiKeyName(): string {
    return 'GOOGLE_API_KEY';
  }

  async listModels(apiKey: string): Promise<ProviderModel[]> {
    const response = await fetch(`${this.baseUrl}/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json() as any;
    return (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => ({
        id: m.name.replace('models/', ''),
        name: m.displayName || m.name.replace('models/', ''),
        provider: this.id,
        supportsStreaming: true,
        contextLength: m.inputTokenLimit,
      }));
  }

  async chatCompletion(request: ProviderChatRequest): Promise<Response> {
    const { apiKey, model, messages, stream, ...options } = request;
    
    const systemInstruction = messages.find(m => m.role === 'system');
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: Array.isArray(m.content) ? m.content.map(this.transformContentPart) : [{ text: m.content }]
      }));

    const body: any = { contents };
    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction.content }]
      };
    }
    if (Object.keys(options).length > 0) {
      body.generationConfig = {
        temperature: options.temperature,
        topP: options.top_p,
        maxOutputTokens: options.max_tokens,
        stopSequences: Array.isArray(options.stop) ? options.stop : (options.stop ? [options.stop] : undefined)
      };
    }

    const path = stream 
      ? `/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`
      : `/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: request.signal
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    if (stream) {
      return this.transformStreamResponse(response);
    }
    return this.transformResponse(response);
  }

  private transformContentPart(part: any) {
    if (part.type === 'text') {
      return { text: part.text };
    }
    if (part.type === 'image_url') {
      const match = part.image_url.url.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        };
      }
    }
    return part;
  }

  private async transformResponse(response: Response): Promise<Response> {
    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const openAIFormat = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      choices: [{
        index: 0,
        message: { role: 'assistant', content: text },
        finish_reason: data.candidates?.[0]?.finishReason === 'STOP' ? 'stop' : 'length'
      }],
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0
      }
    };
    return new Response(JSON.stringify(openAIFormat), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private transformStreamResponse(response: Response): Response {
    const stream = response.body;
    if (!stream) return response;

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    
    const transformedStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (content) {
                const openAIChunk = {
                  choices: [{ delta: { content } }]
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    });

    return new Response(stream.pipeThrough(transformedStream), {
      headers: { 'Content-Type': 'text/event-stream' }
    });
  }

  supportsModel(modelId: string): boolean {
    return true;
  }
}
