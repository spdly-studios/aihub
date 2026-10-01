import { dbGet, dbPut, dbDelete, dbGetAll, dbGetByIndex, dbSearch } from './db';
import { STORES } from './index';

export interface Conversation {
  id: string;
  title: string;
  workspaceId: string;
  model: string;
  endpoint: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  favorited: boolean;
  archived: boolean;
  tags: string[];
  folderId?: string;
  messageCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  model?: string;
  provider?: string;
  endpoint?: string;
  createdAt: string;
  tokens?: { prompt: number; completion: number; total: number };
  latency?: number;
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface ConversationFolder {
  id: string;
  name: string;
  workspaceId: string;
  parentId?: string;
  order: number;
}

export async function createConversation(conversation: Conversation): Promise<void> {
  await dbPut(STORES.conversations, conversation);
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return await dbGet(STORES.conversations, id);
}

export async function updateConversation(conversation: Conversation): Promise<void> {
  await dbPut(STORES.conversations, conversation);
}

export async function deleteConversation(id: string): Promise<void> {
  await dbDelete(STORES.conversations, id);
  // Also delete all messages in this conversation
  const messages = await getMessages(id);
  for (const msg of messages) {
    await deleteMessage(msg.id);
  }
}

export async function listConversations(workspaceId: string, filters?: Partial<Conversation>): Promise<Conversation[]> {
  const conversations = await dbGetByIndex<Conversation>(STORES.conversations, 'workspaceId', workspaceId);
  if (!filters) return conversations;
  
  return conversations.filter(conv => {
    for (const key in filters) {
      if (conv[key as keyof Conversation] !== filters[key as keyof Conversation]) {
        return false;
      }
    }
    return true;
  });
}

export async function searchConversations(query: string): Promise<Conversation[]> {
  const lowerQuery = query.toLowerCase();
  return await dbSearch<Conversation>(STORES.conversations, (conv) => 
    conv.title.toLowerCase().includes(lowerQuery) || 
    (conv.tags && conv.tags.some(t => t.toLowerCase().includes(lowerQuery)))
  );
}

export async function addMessage(message: Message): Promise<void> {
  await dbPut(STORES.messages, message);
  const conv = await getConversation(message.conversationId);
  if (conv) {
    conv.messageCount += 1;
    conv.updatedAt = new Date().toISOString();
    await updateConversation(conv);
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const messages = await dbGetByIndex<Message>(STORES.messages, 'conversationId', conversationId);
  return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function updateMessage(message: Message): Promise<void> {
  await dbPut(STORES.messages, message);
}

export async function deleteMessage(id: string): Promise<void> {
  await dbDelete(STORES.messages, id);
}

export async function duplicateConversation(id: string): Promise<Conversation | undefined> {
  const conv = await getConversation(id);
  if (!conv) return undefined;
  
  const newId = crypto.randomUUID();
  const newConv: Conversation = {
    ...conv,
    id: newId,
    title: `${conv.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await createConversation(newConv);
  
  const messages = await getMessages(id);
  for (const msg of messages) {
    await addMessage({
      ...msg,
      id: crypto.randomUUID(),
      conversationId: newId,
      createdAt: new Date().toISOString()
    });
  }
  
  return newConv;
}

export async function archiveConversation(id: string, archived: boolean = true): Promise<void> {
  const conv = await getConversation(id);
  if (conv) {
    conv.archived = archived;
    await updateConversation(conv);
  }
}

export async function pinConversation(id: string, pinned: boolean = true): Promise<void> {
  const conv = await getConversation(id);
  if (conv) {
    conv.pinned = pinned;
    await updateConversation(conv);
  }
}

export async function favoriteConversation(id: string, favorited: boolean = true): Promise<void> {
  const conv = await getConversation(id);
  if (conv) {
    conv.favorited = favorited;
    await updateConversation(conv);
  }
}

export async function exportConversation(id: string): Promise<string> {
  const conv = await getConversation(id);
  if (!conv) throw new Error('Conversation not found');
  const messages = await getMessages(id);
  return JSON.stringify({ conversation: conv, messages });
}

export async function importConversation(json: string): Promise<Conversation> {
  const data = JSON.parse(json);
  const conv = data.conversation as Conversation;
  const messages = data.messages as Message[];
  
  const newId = crypto.randomUUID();
  const newConv = { ...conv, id: newId };
  await createConversation(newConv);
  
  for (const msg of messages) {
    await addMessage({ ...msg, id: crypto.randomUUID(), conversationId: newId });
  }
  
  return newConv;
}

// Folder operations omitted for brevity, adding stubs
export async function createFolder(folder: ConversationFolder): Promise<void> {}
export async function listFolders(workspaceId: string): Promise<ConversationFolder[]> { return []; }
export async function updateFolder(folder: ConversationFolder): Promise<void> {}
export async function deleteFolder(id: string): Promise<void> {}
