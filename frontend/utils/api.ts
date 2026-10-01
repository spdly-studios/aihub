// API Client

const getAuthHeaders = () => {
  const key = localStorage.getItem('spdly_capi_key') || '';
  return {
    'Content-Type': 'application/json',
    ...(key ? { 'Authorization': `Bearer ${key}` } : {})
  };
};

export async function fetchModels(signal?: AbortSignal) {
  const res = await fetch('/v1/models', { headers: getAuthHeaders(), signal });
  if (!res.ok) throw new Error(`Failed to fetch models: ${res.statusText}`);
  return res.json();
}

export async function sendChat(request: any, signal?: AbortSignal) {
  const res = await fetch('/v1/chat/completions', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
    signal
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
  return res.json();
}

export async function streamChat(
  request: any, 
  onChunk: (chunk: any) => void, 
  onDone: () => void, 
  onError: (err: Error) => void,
  signal?: AbortSignal
) {
  try {
    const res = await fetch('/v1/chat/completions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...request, stream: true }),
      signal
    });

    if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            onChunk(parsed);
          } catch (e) {
            console.error('Failed to parse SSE line:', data);
          }
        }
      }
    }
    onDone();
  } catch (e: any) {
    if (e.name !== 'AbortError') onError(e);
  }
}

export async function checkHealth(signal?: AbortSignal) {
  const res = await fetch('/v1/health', { signal });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function proxyRequest(config: any, signal?: AbortSignal) {
  const res = await fetch('/v1/playground/proxy', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
    signal
  });
  if (!res.ok) throw new Error(`Proxy request failed: ${res.statusText}`);
  return res.json();
}
