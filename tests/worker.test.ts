import { describe, it, expect, vi } from 'vitest';
import { authenticate } from '../src/auth';
import { corsHeaders, handleCORS } from '../src/cors';
import { resolveModel } from '../src/routing/model-router';
import { handleFailover } from '../src/routing/failover';
import { Env } from '../src/types';

describe('Worker Tests', () => {

  const mockEnv: Env = {
    SPDLY_CAPI_KEY: 'test-capi-key',
    NVIDIA_API_KEY: 'test-nvidia-key',
    CEREBRAS_API_KEY: 'test-cerebras-key',
    GOOGLE_API_KEY: 'test-google-key',
    OPENROUTER_API_KEY: 'test-openrouter-key',
    NARAROUTER_API_KEY: 'test-nararouter-key',
    HUGGINGFACE_API_KEY: 'test-hf-key',
    ENVIRONMENT: 'test',
  };

  describe('auth.ts', () => {
    it('should authenticate valid bearer token', () => {
      const req = new Request('https://ai.spdly.eu.cc', {
        headers: { 'Authorization': 'Bearer test-capi-key' }
      });
      const result = authenticate(req, mockEnv);
      expect(result.valid).toBe(true);
    });

    it('should authenticate valid raw token', () => {
      const req = new Request('https://ai.spdly.eu.cc', {
        headers: { 'Authorization': 'test-capi-key' }
      });
      const result = authenticate(req, mockEnv);
      expect(result.valid).toBe(true);
    });

    it('should reject missing token', () => {
      const req = new Request('https://ai.spdly.eu.cc');
      const result = authenticate(req, mockEnv);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing');
    });

    it('should reject invalid token', () => {
      const req = new Request('https://ai.spdly.eu.cc', {
        headers: { 'Authorization': 'Bearer invalid-key' }
      });
      const result = authenticate(req, mockEnv);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('cors.ts', () => {
    it('should handle OPTIONS preflight', () => {
      const req = new Request('https://ai.spdly.eu.cc', { method: 'OPTIONS' });
      const res = handleCORS(req);
      expect(res).not.toBeNull();
      expect(res?.status).toBe(204);
      expect(res?.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should return cors headers for allowed origin', () => {
      const req = new Request('https://ai.spdly.eu.cc', {
        headers: { 'Origin': 'http://localhost:5173' }
      });
      const headers = corsHeaders(req);
      expect(headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    });
  });

  describe('model-router.ts', () => {
    it('should resolve direct provider model', () => {
      const resolved = resolveModel('openrouter/anthropic/claude-3-opus', mockEnv);
      expect(resolved.provider.id).toBe('openrouter');
      expect(resolved.actualModel).toBe('anthropic/claude-3-opus');
      expect(resolved.apiKey).toBe('test-openrouter-key');
    });

    it('should resolve default aliases', () => {
      const resolved = resolveModel('fast', mockEnv);
      expect(resolved.provider.id).toBe('cerebras');
      expect(resolved.actualModel).toBe('llama3.1-8b');
      expect(resolved.apiKey).toBe('test-cerebras-key');
    });

    it('should throw on unknown provider', () => {
      try {
        resolveModel('unknown/model', mockEnv);
      } catch (e: any) {
        expect(e.message).toContain('Unknown provider');
      }
    });

    it('should throw on missing API key', () => {
      const envWithoutKey = { ...mockEnv, CEREBRAS_API_KEY: '' };
      try {
        resolveModel('cerebras/model', envWithoutKey);
      } catch (e: any) {
        expect(e.message).toContain('API key not configured');
      }
    });
  });

  describe('failover.ts', () => {
    it('should return successful response from primary provider', async () => {
      const mockReq = {} as any;
      const primaryProvider = {
        id: 'primary',
        chatCompletion: vi.fn().mockResolvedValue(new Response('Success', { status: 200 }))
      } as any;
      
      const res = await handleFailover(mockReq, primaryProvider, 'key', mockEnv);
      expect(res.status).toBe(200);
      expect(primaryProvider.chatCompletion).toHaveBeenCalled();
    });

    it('should retry if primary throws', async () => {
      const mockReq = {} as any;
      const primaryProvider = {
        id: 'primary',
        chatCompletion: vi.fn()
          .mockRejectedValueOnce(new Error('Failed'))
          .mockResolvedValueOnce(new Response('Success', { status: 200 }))
      } as any;
      
      const res = await handleFailover(mockReq, primaryProvider, 'key', mockEnv);
      expect(res.status).toBe(200);
      expect(primaryProvider.chatCompletion).toHaveBeenCalledTimes(2);
    });

    it('should throw error if provider fails completely', async () => {
      const mockReq = {} as any;
      const primaryProvider = {
        id: 'primary',
        chatCompletion: vi.fn().mockRejectedValue({ status: 500, message: 'Failed primary' })
      } as any;
      
      await expect(handleFailover(mockReq, primaryProvider, 'key', mockEnv)).rejects.toThrowError();
    });
  });

  describe('endpoint-router.ts', () => {
    it('should route using lowest-latency strategy', async () => {
      const { routeToEndpoint, recordLatency } = await import('../src/routing/endpoint-router');
      const endpoints = [{ id: 'ep1' }, { id: 'ep2' }] as any[];
      recordLatency('ep1', 100);
      recordLatency('ep2', 50);
      
      const chosen = await routeToEndpoint(endpoints, 'lowest-latency');
      expect(chosen.id).toBe('ep2');
    });
  });

  describe('chat.ts error normalization', () => {
    it('should normalize errors gracefully', async () => {
      const { handleChat } = await import('../src/api/chat');
      const req = new Request('https://ai.spdly.eu.cc/v1/chat/completions', { method: 'POST', body: 'invalid-json' });
      const res = await handleChat(req, mockEnv);
      const data = await res.json() as any;
      
      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.message).toBe('Invalid JSON');
    });
  });

});
