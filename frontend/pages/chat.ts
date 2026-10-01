import { icon } from '../utils/icons';
import { getState, setState, subscribe } from '../state';
import { getSetting } from '../storage/settings';
import * as convStore from '../storage/conversations';
import { streamChat } from '../utils/api';
import { generateId, formatDate, escapeHtml, copyToClipboard } from '../utils/helpers';
import { notify } from '../components/notifications';

let activeConversationId: string | null = null;
let abortController: AbortController | null = null;

export async function render(): Promise<void> {
  const content = document.getElementById('content')!;
  content.innerHTML = buildChatLayout();
  
  await loadConversations();
  setupChatEventListeners();
  
  // Set up auto-resize for textarea
  const inputEl = document.getElementById('chat-input') as HTMLTextAreaElement;
  if (inputEl) {
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = (inputEl.scrollHeight) + 'px';
    });
  }
}

function buildChatLayout(): string {
  return `
    <div class="chat-layout" style="display: flex; height: 100vh; overflow: hidden; background: var(--bg-primary);">
      <!-- Sidebar -->
      <aside class="sidebar" style="width: 280px; background: var(--bg-secondary); border-right: 1px solid var(--border-color); display: flex; flex-direction: column;">
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input type="text" id="conv-search" placeholder="Search chats..." style="flex: 1; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary);">
          </div>
          <button id="new-chat-btn" style="width: 100%; padding: 0.5rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
            ${icon('plus')} New Chat
          </button>
        </div>
        <div style="display: flex; padding: 0.5rem; gap: 0.5rem; overflow-x: auto; font-size: 0.8rem; border-bottom: 1px solid var(--border-color);">
          <span style="cursor: pointer; font-weight: bold;">All</span>
          <span style="cursor: pointer;">Pinned</span>
          <span style="cursor: pointer;">Favorites</span>
        </div>
        <div id="conv-list" style="flex: 1; overflow-y: auto; padding: 0.5rem;">
          <!-- Conversations go here -->
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main style="flex: 1; display: flex; flex-direction: column; background: var(--bg-primary);">
        <header style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <select id="model-select" style="padding: 0.5rem; border-radius: 4px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color);">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
            </select>
          </div>
          <div>
            <button id="toggle-context-btn" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">
              ${icon('panel-right')}
            </button>
            <button id="multimodel-mode-btn" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: 0.5rem;">
              Compare Models
            </button>
          </div>
        </header>

        <div id="messages-container" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
          <!-- Messages go here -->
        </div>

        <div style="padding: 1rem; border-top: 1px solid var(--border-color); background: var(--bg-primary);">
          <div style="display: flex; flex-direction: column; max-width: 800px; margin: 0 auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem;">
            <textarea id="chat-input" placeholder="Type a message..." style="width: 100%; min-height: 44px; max-height: 200px; resize: none; background: transparent; border: none; color: var(--text-primary); padding: 0.5rem; font-family: inherit; outline: none;"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
              <div style="display: flex; gap: 0.5rem; color: var(--text-secondary);">
                <button title="Attach File" style="background:none; border:none; color:inherit; cursor:pointer;">${icon('paperclip')}</button>
                <span id="token-estimate" style="font-size: 0.8rem; display: flex; align-items: center;">~0 tokens</span>
              </div>
              <button id="send-btn" style="background: var(--primary-color); color: white; border: none; border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                Send ${icon('send')}
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Context Panel -->
      <aside id="context-panel" style="width: 300px; background: var(--bg-secondary); border-left: 1px solid var(--border-color); display: none; flex-direction: column;">
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
          <strong>Context</strong>
          <button id="close-context-btn" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">${icon('x')}</button>
        </div>
        <div style="padding: 1rem; flex: 1; overflow-y: auto;">
          <label style="font-size: 0.8rem; color: var(--text-secondary);">System Prompt</label>
          <textarea style="width: 100%; height: 100px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.5rem; margin-top: 0.5rem; border-radius: 4px;"></textarea>
          <div style="margin-top: 1rem;">
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Messages: <span id="ctx-msg-count">0</span></p>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Context used: <span id="ctx-token-count">0</span> / 8k</p>
          </div>
        </div>
      </aside>
    </div>
  `;
}

async function loadConversations() {
  const listEl = document.getElementById('conv-list');
  if (!listEl) return;
  
  try {
    const convs = await convStore.listConversations('default');
    listEl.innerHTML = convs.map(c => `
      <div class="conv-item" data-id="${c.id}" style="padding: 0.75rem; border-radius: 4px; cursor: pointer; margin-bottom: 0.25rem; background: ${c.id === activeConversationId ? 'var(--bg-hover)' : 'transparent'};">
        <div style="font-weight: bold; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.title || 'New Chat')}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${c.updatedAt ? formatDate(new Date(c.updatedAt)) : ''}
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.conv-item').forEach(el => {
      el.addEventListener('click', () => loadConversation((el as HTMLElement).dataset.id!));
    });
  } catch (err) {
    console.error('Failed to load conversations', err);
  }
}

async function loadConversation(id: string) {
  activeConversationId = id;
  await loadConversations(); // Re-render sidebar to update active state
  const container = document.getElementById('messages-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  try {
    const conv = await convStore.getConversation(id);
    if (conv) {
      const messages = await convStore.getMessages(id);
      messages.forEach(m => {
        container.appendChild(createMessageElement(m));
      });
      scrollToBottom();
    }
  } catch (err) {
    console.error('Failed to load conversation messages', err);
  }
}

function setupChatEventListeners() {
  const newBtn = document.getElementById('new-chat-btn');
  newBtn?.addEventListener('click', async () => {
    activeConversationId = null;
    const container = document.getElementById('messages-container');
    if (container) container.innerHTML = '';
    await loadConversations();
  });

  const sendBtn = document.getElementById('send-btn');
  const inputEl = document.getElementById('chat-input') as HTMLTextAreaElement;
  
  const handleSend = async () => {
    const content = inputEl.value.trim();
    if (!content) return;
    
    inputEl.value = '';
    inputEl.style.height = 'auto';
    
    if (!activeConversationId) {
      const newConvId = generateId();
      await convStore.createConversation({ 
          id: newConvId, 
          title: content.substring(0, 30),
          workspaceId: 'default',
          model: (document.getElementById('model-select') as HTMLSelectElement | null)?.value || 'gpt-4-turbo',
          endpoint: 'openai',
          systemPrompt: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pinned: false,
          favorited: false,
          archived: false,
          tags: [],
          messageCount: 0
      });
      activeConversationId = newConvId;
      await loadConversations();
    }
    
    if (!activeConversationId) return;

    const userMsg = { id: generateId(), conversationId: activeConversationId, role: 'user' as const, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await convStore.addMessage(userMsg);
    
    const container = document.getElementById('messages-container');
    container?.appendChild(createMessageElement(userMsg as any));
    scrollToBottom();
    
    const assistMsg = { id: generateId(), conversationId: activeConversationId, role: 'assistant' as const, content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const assistEl = createMessageElement(assistMsg as any);
    container?.appendChild(assistEl);
    scrollToBottom();
    
    abortController = new AbortController();
    
    try {
      const conv = await convStore.getConversation(activeConversationId);
      if (!conv) return;
      const messages = await convStore.getMessages(activeConversationId);
      
      const selectEl = document.getElementById('model-select') as HTMLSelectElement | null;
      const model = selectEl?.value || 'gpt-4o';
      
      let fullText = '';
      const contentEl = assistEl.querySelector('.msg-content') as HTMLElement;
      
      const requestPayload = { model, messages: messages.map(m => ({ role: m.role, content: m.content })) };
      
      await streamChat(
        requestPayload,
        (chunk: any) => {
          const delta = chunk.choices?.[0]?.delta?.content || '';
          fullText += delta;
          contentEl.innerHTML = parseMarkdown(fullText);
          scrollToBottom();
        },
        async () => {
          assistMsg.content = fullText;
          await convStore.addMessage(assistMsg);
        },
        (err: any) => {
          contentEl.innerHTML += `<br><span style="color:red;">Error: ${err.message}</span>`;
        },
        abortController.signal
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        notify('Chat error: ' + err.message, 'error');
      }
    }
  };

  sendBtn?.addEventListener('click', handleSend);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  document.getElementById('toggle-context-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('context-panel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  });
  
  document.getElementById('close-context-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('context-panel');
    if (panel) panel.style.display = 'none';
  });
  
  document.getElementById('multimodel-mode-btn')?.addEventListener('click', async () => {
     // navigate to multi-model chat
     setState({ currentRoute: '/multimodel' });
     const { render: renderMultimodel } = await import('./chat-multimodel');
     renderMultimodel();
  });
}

function createMessageElement(msg: any): HTMLElement {
  const el = document.createElement('div');
  const isUser = msg.role === 'user';
  el.className = `message ${msg.role}`;
  el.style.cssText = `
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: ${isUser ? 'var(--bg-primary)' : 'var(--bg-secondary)'};
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    border: 1px solid ${isUser ? 'transparent' : 'var(--border-color)'};
  `;
  
  el.innerHTML = `
    <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isUser ? 'var(--primary-color)' : 'var(--accent-color)'}; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
      ${icon(isUser ? 'user' : 'bot')}
    </div>
    <div style="flex: 1; overflow: hidden;">
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
        ${isUser ? 'You' : 'Assistant'} &middot; ${msg.timestamp ? formatDate(new Date(msg.timestamp)) : ''}
      </div>
      <div class="msg-content" style="line-height: 1.5; color: var(--text-primary); word-wrap: break-word;">
        ${parseMarkdown(msg.content)}
      </div>
      <div class="msg-actions" style="display: flex; gap: 0.5rem; margin-top: 0.5rem; opacity: 0; transition: opacity 0.2s;">
        <button class="copy-btn" title="Copy" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;">${icon('copy')}</button>
        ${!isUser ? `<button class="regen-btn" title="Regenerate" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;">${icon('refresh')}</button>` : ''}
      </div>
    </div>
  `;
  
  el.addEventListener('mouseenter', () => {
    (el.querySelector('.msg-actions') as HTMLElement).style.opacity = '1';
  });
  el.addEventListener('mouseleave', () => {
    (el.querySelector('.msg-actions') as HTMLElement).style.opacity = '0';
  });
  
  el.querySelector('.copy-btn')?.addEventListener('click', () => {
    copyToClipboard(msg.content);
    notify('Copied to clipboard', 'success');
  });
  
  return el;
}

function scrollToBottom() {
  const container = document.getElementById('messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Basic markdown parser
function parseMarkdown(text: string): string {
  if (!text) return '';
  
  // Escape HTML first
  let html = escapeHtml(text);
  
  // Code blocks
  html = html.replace(/&#96;&#96;&#96;(\w*)\n([\s\S]*?)&#96;&#96;&#96;/g, (match, lang, code) => {
    return `<pre style="background: var(--bg-tertiary); padding: 1rem; border-radius: 4px; overflow-x: auto; margin: 0.5rem 0;"><code>${code}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/&#96;([^&#96;]+)&#96;/g, '<code style="background: var(--bg-tertiary); padding: 0.1rem 0.3rem; border-radius: 3px;">$1</code>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--primary-color); text-decoration: none;">$1</a>');
  
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--border-color); padding-left: 1rem; margin: 0.5rem 0; color: var(--text-secondary);">$1</blockquote>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
}
