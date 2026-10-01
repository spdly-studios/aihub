import { dbGet, dbPut, dbDelete, dbGetAll } from './db';
import { STORES } from './index';

export interface EndpointConfig {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  endpointUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  protocol: 'openai' | 'rest' | 'custom';
  authType: 'none' | 'bearer' | 'api-key-header' | 'api-key-query' | 'basic' | 'custom';
  authHeader?: string;
  apiKey?: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  requestTemplate?: string;
  responseTextPath?: string;
  streamingFormat?: 'sse' | 'chunked' | 'none';
  modelExtractionPath?: string;
  timeout: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failure' | 'unknown';
  lastTestLatency?: number;
}

export async function createEndpoint(endpoint: EndpointConfig): Promise<void> {
  await dbPut(STORES.endpoints, endpoint);
}

export async function getEndpoint(id: string): Promise<EndpointConfig | undefined> {
  return await dbGet(STORES.endpoints, id);
}

export async function updateEndpoint(endpoint: EndpointConfig): Promise<void> {
  endpoint.updatedAt = new Date().toISOString();
  await dbPut(STORES.endpoints, endpoint);
}

export async function deleteEndpoint(id: string): Promise<void> {
  await dbDelete(STORES.endpoints, id);
}

export async function listEndpoints(): Promise<EndpointConfig[]> {
  return await dbGetAll(STORES.endpoints);
}

export async function duplicateEndpoint(id: string): Promise<EndpointConfig | undefined> {
  const ep = await getEndpoint(id);
  if (!ep) return undefined;
  
  const newEp: EndpointConfig = {
    ...ep,
    id: crypto.randomUUID(),
    name: `${ep.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await createEndpoint(newEp);
  return newEp;
}

export async function exportEndpoints(): Promise<string> {
  const endpoints = await listEndpoints();
  // Strip API keys
  const exportable = endpoints.map(ep => ({ ...ep, apiKey: undefined }));
  return JSON.stringify(exportable, null, 2);
}

export async function importEndpoints(json: string): Promise<void> {
  const endpoints: EndpointConfig[] = JSON.parse(json);
  for (const ep of endpoints) {
    ep.id = crypto.randomUUID();
    ep.createdAt = new Date().toISOString();
    ep.updatedAt = new Date().toISOString();
    await createEndpoint(ep);
  }
}

export function getEndpointApiKey(id: string): string | null {
  return sessionStorage.getItem(`ep_key_${id}`);
}

export function setEndpointApiKey(id: string, key: string): void {
  sessionStorage.setItem(`ep_key_${id}`, key);
}
