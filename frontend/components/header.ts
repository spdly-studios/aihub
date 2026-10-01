import { icon } from '../utils/icons';
import { getSetting, setSetting } from '../storage/settings';
import { getState, setState, subscribe } from '../state';
import { openCommandPalette } from './command-palette';

export function initHeader(): void {
  const header = document.getElementById('app-header');
  if (!header) return;
  header.innerHTML = buildHeader();
  setupHeaderEvents();
  subscribe('currentRoute', updateTitle);
}

function buildHeader(): string {
  const theme = getSetting('theme');
  const debugMode = getSetting('debugMode');
  const currentModel = getSetting('defaultModel');
  
  return `
    <header class="top-header">
      <div class="header-left">
        <button id="mobile-sidebar-toggle" class="icon-btn mobile-only">
          ${icon('menu')}
        </button>
        <div class="breadcrumb">
          <span id="page-title">Chat</span>
        </div>
      </div>
      <div class="header-center">
        <div class="global-search" id="global-search-trigger">
          ${icon('search')}
          <span>Search or jump to...</span>
          <span class="shortcut-hint">Cmd+K</span>
        </div>
      </div>
      <div class="header-right">
        <div class="status-indicator">
          <span class="status-dot online"></span>
          <span class="model-name">${currentModel}</span>
        </div>
        <button id="debug-toggle" class="icon-btn ${debugMode ? 'active' : ''}" title="Toggle Debug Mode">
          ${icon('terminal')}
        </button>
        <button id="theme-toggle" class="icon-btn" title="Toggle Theme">
          ${theme === 'dark' ? icon('sun') : icon('moon')}
        </button>
      </div>
    </header>
  `;
}

function setupHeaderEvents(): void {
  const searchTrigger = document.getElementById('global-search-trigger');
  if (searchTrigger) {
    searchTrigger.addEventListener('click', openCommandPalette);
  }

  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const sidebar = document.querySelector('.sidebar-container');
      if (sidebar) {
        sidebar.classList.toggle('mobile-open');
      }
    });
  }
  
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = getSetting('theme');
      const next = current === 'dark' ? 'light' : 'dark';
      setSetting('theme', next);
      themeToggle.innerHTML = next === 'dark' ? icon('sun') : icon('moon');
      document.documentElement.setAttribute('data-theme', next);
    });
  }

  const debugToggle = document.getElementById('debug-toggle');
  if (debugToggle) {
    debugToggle.addEventListener('click', () => {
      const current = getSetting('debugMode');
      const next = !current;
      setSetting('debugMode', next);
      if (next) debugToggle.classList.add('active');
      else debugToggle.classList.remove('active');
      setState({ debugMode: next });
    });
  }
}

function updateTitle(path: string): void {
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    const title = path === '/' ? 'Chat' : 
                  path.substring(1).charAt(0).toUpperCase() + path.substring(2);
    titleEl.textContent = title || 'Dashboard';
  }
}
