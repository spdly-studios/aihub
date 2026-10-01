import { icon } from '../utils/icons';
import { getState, setState } from '../state';
import { streamChat } from '../utils/api';
import { generateId, escapeHtml } from '../utils/helpers';
import { notify } from '../components/notifications';

interface ModelPanel {
  id: string;
  model: string;
  provider: string;
  temperature: number;
  content: string;
  status: 'idle' | 'generating' | 'done' | 'error';
  latency?: number;
  tokens?: number;
  abortController?: AbortController;
}

let panels: ModelPanel[] = [];

export async function render(): Promise<void> {
  const content = document.getElementById('content')!;
  
  // Initialize with 2 default panels
  panels = [
    { id: generateId(), model: 'gpt-4', provider: 'openai', temperature: 0.7, content: '', status: 'idle' },
    { id: generateId(), model: 'claude-3-opus', provider: 'anthropic', temperature: 0.7, content: '', status: 'idle' }
  ];
  
  content.innerHTML = buildMultimodelLayout();
  renderPanels();
  setupEventListeners();
}

function buildMultimodelLayout(): string {
  return `
    <div style="display: flex; flex-direction: column; height: 100vh; background: var(--bg-primary);">
      <header style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button id="back-to-chat" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            ${icon('arrow-left')} Back to Chat
          </button>
          <h2 style="margin: 0; font-size: 1.2rem;">Multi-Model Comparison</h2>
        </div>
        <button id="add-model-btn" style="padding: 0.5rem 1rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer; color: var(--text-primary);">
          + Add Model
        </button>
      </header>

      <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; gap: 1rem;">
          <textarea id="multi-prompt-input" placeholder="Enter prompt to send to all models..." style="flex: 1; min-height: 80px; resize: vertical; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); padding: 0.5rem;"></textarea>
          <button id="send-all-btn" style="background: var(--primary-color); color: white; border: none; border-radius: 4px; padding: 0 2rem; cursor: pointer; font-weight: bold;">
            Send to All
          </button>
        </div>
      </div>

      <div id="panels-container" style="flex: 1; display: flex; overflow-x: auto; padding: 1rem; gap: 1rem;">
        <!-- Panels rendered here -->
      </div>
    </div>
  `;
}

function renderPanels() {
  const container = document.getElementById('panels-container');
  if (!container) return;
  
  container.innerHTML = panels.map(p => `
    <div class="model-panel" data-id="${p.id}" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
      <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center;">
        <select class="panel-model-select" style="padding: 0.25rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary);">
          <option value="gpt-4" ${p.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
          <option value="gpt-3.5-turbo" ${p.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5</option>
          <option value="claude-3-opus" ${p.model === 'claude-3-opus' ? 'selected' : ''}>Claude 3 Opus</option>
          <option value="gemini-pro" ${p.model === 'gemini-pro' ? 'selected' : ''}>Gemini Pro</option>
        </select>
        
        <div style="display: flex; gap: 0.5rem;">
          <input type="number" class="temp-input" value="${p.temperature}" min="0" max="2" step="0.1" style="width: 50px; padding: 0.25rem; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;" title="Temperature">
          <button class="remove-panel-btn" style="background: none; border: none; color: var(--error-color); cursor: pointer;">${icon('trash')}</button>
        </div>
      </div>
      
      <div class="panel-content" style="flex: 1; padding: 1rem; overflow-y: auto; background: var(--bg-primary); word-wrap: break-word; line-height: 1.5;">
        ${p.status === 'idle' && !p.content ? '<span style="color: var(--text-secondary); font-style: italic;">Waiting for prompt...</span>' : ''}
        ${p.content ? parseBasicMarkdown(p.content) : ''}
        ${p.status === 'generating' ? '<span class="cursor" style="display: inline-block; width: 8px; height: 1em; background: var(--text-primary); animation: blink 1s step-end infinite;"></span>' : ''}
        ${p.status === 'error' ? `<span style="color: var(--error-color);">Error generating response</span>` : ''}
      </div>
      
      <div style="padding: 0.5rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
        <span>${p.status === 'generating' ? 'Generating...' : (p.status === 'done' ? 'Complete' : 'Ready')}</span>
        <div>
          ${p.latency ? `<span>${p.latency}ms</span>` : ''}
          ${p.tokens ? `<span style="margin-left: 0.5rem;">${p.tokens} tok</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
  
  // Attach event listeners for panels
  document.querySelectorAll('.model-panel').forEach(el => {
    const id = (el as HTMLElement).dataset.id!;
    const panel = panels.find(p => p.id === id);
    if (!panel) return;
    
    el.querySelector('.panel-model-select')?.addEventListener('change', (e) => {
      panel.model = (e.target as HTMLSelectElement).value;
    });
    
    el.querySelector('.temp-input')?.addEventListener('change', (e) => {
      panel.temperature = parseFloat((e.target as HTMLInputElement).value);
    });
    
    el.querySelector('.remove-panel-btn')?.addEventListener('click', () => {
      panels = panels.filter(p => p.id !== id);
      renderPanels();
    });
  });
}

function setupEventListeners() {
  document.getElementById('back-to-chat')?.addEventListener('click', async () => {
    setState({ currentRoute: '/' });
    const { render: renderChat } = await import('./chat');
    renderChat();
  });

  document.getElementById('add-model-btn')?.addEventListener('click', () => {
    if (panels.length >= 4) {
      notify('Maximum 4 models supported in comparison view', 'warning');
      return;
    }
    panels.push({ id: generateId(), model: 'gpt-3.5-turbo', provider: 'openai', temperature: 0.7, content: '', status: 'idle' });
    renderPanels();
  });

  document.getElementById('send-all-btn')?.addEventListener('click', () => {
    const prompt = (document.getElementById('multi-prompt-input') as HTMLTextAreaElement).value.trim();
    if (!prompt) return;
    
    panels.forEach(p => {
      if (p.abortController) p.abortController.abort();
      p.content = '';
      p.status = 'generating';
      p.abortController = new AbortController();
      p.latency = 0; // would calculate in real implementation
      p.tokens = 0;
      
      generateForPanel(p, prompt);
    });
    
    renderPanels();
  });
}

async function generateForPanel(panel: ModelPanel, prompt: string) {
  const startTime = Date.now();
  try {
    const messages = [{ role: 'user', content: prompt }];
    
    await streamChat(
      { model: panel.model, messages },
      (chunk: any) => {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        panel.content += delta;
        updatePanelUI(panel);
      },
      () => {
        panel.status = 'done';
        panel.latency = Date.now() - startTime;
        panel.tokens = Math.floor(panel.content.length / 4); // rough estimate
        updatePanelUI(panel);
      },
      (err: any) => {
        panel.status = 'error';
        updatePanelUI(panel);
      },
      panel.abortController!.signal
    );
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      panel.status = 'error';
      updatePanelUI(panel);
    }
  }
}

function updatePanelUI(panel: ModelPanel) {
  const panelEl = document.querySelector(`.model-panel[data-id="${panel.id}"]`);
  if (!panelEl) return;
  
  const contentEl = panelEl.querySelector('.panel-content');
  if (contentEl) {
    contentEl.innerHTML = parseBasicMarkdown(panel.content) + (panel.status === 'generating' ? '<span class="cursor" style="display: inline-block; width: 8px; height: 1em; background: var(--text-primary); animation: blink 1s step-end infinite;"></span>' : '');
    contentEl.scrollTop = contentEl.scrollHeight;
  }
  
  // Update status footer (lazy re-render for simplicity)
  if (panel.status === 'done' || panel.status === 'error') {
     renderPanels();
  }
}

function parseBasicMarkdown(text: string): string {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/&#96;([^&#96;]+)&#96;/g, '<code style="background: var(--bg-tertiary); padding: 0.1rem 0.3rem; border-radius: 3px;">$1</code>');
  return html;
}
