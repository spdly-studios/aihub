import { dbGetAll, dbClear } from './db';
import { STORES } from './index';
import { getAllSettings, setSetting } from './settings';
import { createConversation, addMessage } from './conversations';
import { createPrompt } from './prompts';
import { createEndpoint } from './endpoints';
import { createCollection } from './request-history';

export interface ExportData {
  version: '1.0';
  exportedAt: string;
  application: 'spdly-ai';
  data: {
    conversations?: any[];
    messages?: any[];
    prompts?: any[];
    workspaces?: any[];
    endpoints?: any[];
    collections?: any[];
    agents?: any[];
    settings?: any;
    usage?: any[];
  };
}

export async function exportAll(options?: { includeConversations?: boolean; includeSettings?: boolean; includePrompts?: boolean }): Promise<ExportData> {
  const data: ExportData['data'] = {};
  
  if (options?.includeConversations !== false) {
    data.conversations = await dbGetAll(STORES.conversations);
    data.messages = await dbGetAll(STORES.messages);
  }
  
  if (options?.includePrompts !== false) {
    data.prompts = await dbGetAll(STORES.prompts);
  }
  
  data.endpoints = await dbGetAll(STORES.endpoints);
  data.collections = await dbGetAll(STORES.collections);
  data.usage = await dbGetAll(STORES.usage);
  
  if (options?.includeSettings !== false) {
    data.settings = getAllSettings();
  }
  
  return stripSensitiveData({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    application: 'spdly-ai',
    data
  });
}

export async function importAll(data: ExportData): Promise<{ imported: Record<string, number>; errors: string[] }> {
  const result = { imported: {} as Record<string, number>, errors: [] as string[] };
  
  try {
    if (data.data.settings) {
      for (const [key, value] of Object.entries(data.data.settings)) {
        if (key !== 'capiKey') {
          setSetting(key as any, value as any);
        }
      }
      result.imported['settings'] = 1;
    }

    if (data.data.conversations) {
      for (const conv of data.data.conversations) {
        await createConversation(conv);
      }
      result.imported['conversations'] = data.data.conversations.length;
    }

    if (data.data.messages) {
      for (const msg of data.data.messages) {
        await addMessage(msg);
      }
      result.imported['messages'] = data.data.messages.length;
    }

    if (data.data.prompts) {
      for (const p of data.data.prompts) {
        await createPrompt(p);
      }
      result.imported['prompts'] = data.data.prompts.length;
    }

    if (data.data.endpoints) {
      for (const ep of data.data.endpoints) {
        await createEndpoint(ep);
      }
      result.imported['endpoints'] = data.data.endpoints.length;
    }

    if (data.data.collections) {
      for (const col of data.data.collections) {
        await createCollection(col);
      }
      result.imported['collections'] = data.data.collections.length;
    }

  } catch (error: any) {
    result.errors.push(error.message);
  }
  
  return result;
}

export function stripSensitiveData(data: ExportData): ExportData {
  const clone = JSON.parse(JSON.stringify(data)) as ExportData;
  
  if (clone.data.endpoints) {
    clone.data.endpoints = clone.data.endpoints.map(ep => {
      const clean = { ...ep };
      delete clean.apiKey;
      delete clean.authHeader;
      return clean;
    });
  }
  
  if (clone.data.settings) {
    delete clone.data.settings.capiKey;
  }
  
  return clone;
}
