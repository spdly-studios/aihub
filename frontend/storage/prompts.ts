import { dbGet, dbPut, dbDelete, dbGetAll, dbSearch } from './db';
import { STORES } from './index';

export interface PromptVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

export interface PromptVersion {
  version: number;
  content: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  systemPrompt?: string;
  variables: PromptVariable[];
  tags: string[];
  favorited: boolean;
  version: number;
  versions: PromptVersion[];
  createdAt: string;
  updatedAt: string;
}

export async function createPrompt(prompt: Prompt): Promise<void> {
  await dbPut(STORES.prompts, prompt);
}

export async function getPrompt(id: string): Promise<Prompt | undefined> {
  return await dbGet(STORES.prompts, id);
}

export async function updatePrompt(prompt: Prompt): Promise<void> {
  prompt.updatedAt = new Date().toISOString();
  await dbPut(STORES.prompts, prompt);
}

export async function deletePrompt(id: string): Promise<void> {
  await dbDelete(STORES.prompts, id);
}

export async function listPrompts(): Promise<Prompt[]> {
  return await dbGetAll(STORES.prompts);
}

export async function searchPrompts(query: string): Promise<Prompt[]> {
  const q = query.toLowerCase();
  return await dbSearch<Prompt>(STORES.prompts, p => 
    p.title.toLowerCase().includes(q) || 
    p.description.toLowerCase().includes(q) || 
    p.tags.some(t => t.toLowerCase().includes(q))
  );
}

export async function duplicatePrompt(id: string): Promise<Prompt | undefined> {
  const p = await getPrompt(id);
  if (!p) return undefined;
  
  const newPrompt: Prompt = {
    ...p,
    id: crypto.randomUUID(),
    title: `${p.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await createPrompt(newPrompt);
  return newPrompt;
}

export async function favoritePrompt(id: string, favorited: boolean = true): Promise<void> {
  const p = await getPrompt(id);
  if (p) {
    p.favorited = favorited;
    await updatePrompt(p);
  }
}

export async function addVersion(id: string, newContent: string): Promise<void> {
  const p = await getPrompt(id);
  if (!p) return;
  
  p.version += 1;
  p.versions.push({
    version: p.version,
    content: newContent,
    createdAt: new Date().toISOString()
  });
  p.content = newContent;
  await updatePrompt(p);
}

export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [...content.matchAll(regex)];
  return Array.from(new Set(matches.map(m => m[1].trim())));
}

export function resolveVariables(prompt: Prompt, values: Record<string, string>): string {
  let resolved = prompt.content;
  for (const [key, value] of Object.entries(values)) {
    resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return resolved;
}

export async function exportPrompts(): Promise<string> {
  const prompts = await listPrompts();
  return JSON.stringify(prompts, null, 2);
}

export async function importPrompts(json: string): Promise<void> {
  const prompts: Prompt[] = JSON.parse(json);
  for (const p of prompts) {
    p.id = crypto.randomUUID();
    p.createdAt = new Date().toISOString();
    p.updatedAt = new Date().toISOString();
    await createPrompt(p);
  }
}
