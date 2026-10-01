export const DB_NAME = 'spdly-ai';
export const DB_VERSION = 1;

export const STORES = {
  conversations: 'conversations',
  messages: 'messages',
  prompts: 'prompts',
  files: 'files',
  workspaces: 'workspaces',
  endpoints: 'endpoints',
  collections: 'collections',
  requestHistory: 'requestHistory',
  agents: 'agents',
  tools: 'tools',
  usage: 'usage',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export async function initStorage(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB is not supported in this environment');
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.conversations)) {
        const store = db.createObjectStore(STORES.conversations, { keyPath: 'id' });
        store.createIndex('workspaceId', 'workspaceId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.messages)) {
        const store = db.createObjectStore(STORES.messages, { keyPath: 'id' });
        store.createIndex('conversationId', 'conversationId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.prompts)) {
        const store = db.createObjectStore(STORES.prompts, { keyPath: 'id' });
        store.createIndex('tags', 'tags', { multiEntry: true, unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.files)) {
        db.createObjectStore(STORES.files, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.workspaces)) {
        db.createObjectStore(STORES.workspaces, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.endpoints)) {
        db.createObjectStore(STORES.endpoints, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.collections)) {
        db.createObjectStore(STORES.collections, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.requestHistory)) {
        const store = db.createObjectStore(STORES.requestHistory, { keyPath: 'id' });
        store.createIndex('collectionId', 'collectionId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.agents)) {
        db.createObjectStore(STORES.agents, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.tools)) {
        db.createObjectStore(STORES.tools, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.usage)) {
        const store = db.createObjectStore(STORES.usage, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });

  return dbPromise;
}

export async function getDB(): Promise<IDBDatabase> {
  return initStorage();
}
