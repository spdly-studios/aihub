import { dbGet, dbPut, dbDelete, dbGetAll, dbGetByIndex } from './db';
import { STORES } from './index';

export interface RequestRecord {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  endpoint?: string;
  model?: string;
  status: number;
  duration: number;
  streaming: boolean;
  requestSize: number;
  responseSize: number;
  requestBodySaved: boolean;
  requestBody?: string;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  collectionId?: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  collectionId: string;
}

export interface RequestCollection {
  id: string;
  name: string;
  description: string;
  requests: SavedRequest[];
  createdAt: string;
  updatedAt: string;
}

export async function addRequestHistory(record: RequestRecord): Promise<void> {
  await dbPut(STORES.requestHistory, record);
}

export async function getRequestHistory(): Promise<RequestRecord[]> {
  return await dbGetAll(STORES.requestHistory);
}

export async function getRequestRecord(id: string): Promise<RequestRecord | undefined> {
  return await dbGet(STORES.requestHistory, id);
}

export async function clearRequestHistory(): Promise<void> {
  // Logic to clear non-collection requests
  const reqs = await dbGetAll<RequestRecord>(STORES.requestHistory);
  for (const r of reqs) {
    if (!r.collectionId) {
      await dbDelete(STORES.requestHistory, r.id);
    }
  }
}

export async function createCollection(collection: RequestCollection): Promise<void> {
  await dbPut(STORES.collections, collection);
}

export async function getCollection(id: string): Promise<RequestCollection | undefined> {
  return await dbGet(STORES.collections, id);
}

export async function listCollections(): Promise<RequestCollection[]> {
  return await dbGetAll(STORES.collections);
}

export async function updateCollection(collection: RequestCollection): Promise<void> {
  collection.updatedAt = new Date().toISOString();
  await dbPut(STORES.collections, collection);
}

export async function deleteCollection(id: string): Promise<void> {
  await dbDelete(STORES.collections, id);
  const reqs = await dbGetByIndex<RequestRecord>(STORES.requestHistory, 'collectionId', id);
  for (const r of reqs) {
    await dbDelete(STORES.requestHistory, r.id);
  }
}
