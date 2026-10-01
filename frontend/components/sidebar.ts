import { icon } from '../utils/icons';
import { getState, setState, subscribe } from '../state';
import { navigate, getRoutes, getCurrentPath } from '../router';
import { getSetting, setSetting } from '../storage/settings';

export function initSidebar(): void {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = buildSidebar();
  
  const isCollapsed = getSetting('sidebarCollapsed');
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }

  setupSidebarEvents();
  
  // Subscribe to route changes to update active state
  subscribe('currentRoute', updateActiveItem);
}

function buildSidebar(): string {
  const theme = getSetting('theme');
  
  return `
      <div class="sidebar-header">
        <div class="logo">SPDLY AI</div>
        <button id="sidebar-toggle" class="sidebar-toggle" title="Toggle Sidebar">
          ${icon('menu')}
        </button>
      </div>
      <nav class="sidebar-nav">
          <a href="/" class="sidebar-nav-item" data-path="/">
            ${icon('message-square')} <span>Chat</span>
          </a>
          <a href="/workspace" class="sidebar-nav-item" data-path="/workspace">
            ${icon('layout')} <span>Workspace</span>
          </a>
          <a href="/playground" class="sidebar-nav-item" data-path="/playground">
            ${icon('play')} <span>Playground</span>
          </a>
          <a href="/endpoints" class="sidebar-nav-item" data-path="/endpoints">
            ${icon('server')} <span>Endpoints</span>
          </a>
          <a href="/models" class="sidebar-nav-item" data-path="/models">
            ${icon('box')} <span>Models</span>
          </a>
          <a href="/providers" class="sidebar-nav-item" data-path="/providers">
            ${icon('cloud')} <span>Providers</span>
          </a>
          <a href="/requests" class="sidebar-nav-item" data-path="/requests">
            ${icon('activity')} <span>Requests</span>
          </a>
          <a href="/files" class="sidebar-nav-item" data-path="/files">
            ${icon('folder')} <span>Files</span>
          </a>
          <a href="/prompts" class="sidebar-nav-item" data-path="/prompts">
            ${icon('edit-3')} <span>Prompts</span>
          </a>
          <a href="/agents" class="sidebar-nav-item" data-path="/agents">
            ${icon('users')} <span>Agents</span>
          </a>
          <a href="/tools" class="sidebar-nav-item" data-path="/tools">
            ${icon('tool')} <span>Tools</span>
          </a>
          <a href="/api" class="sidebar-nav-item" data-path="/api">
            ${icon('code')} <span>API</span>
          </a>
          <a href="/usage" class="sidebar-nav-item" data-path="/usage">
            ${icon('pie-chart')} <span>Usage</span>
          </a>
          <a href="/settings" class="sidebar-nav-item" data-path="/settings">
            ${icon('settings')} <span>Settings</span>
          </a>
      </nav>
      <div class="sidebar-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:0.5rem; color:var(--text-secondary)">
          ${icon('user')} <span>User</span>
        </div>
        <button id="theme-toggle-sidebar" class="sidebar-toggle" title="Toggle Theme">
          ${theme === 'dark' ? icon('sun') : icon('moon')}
        </button>
      </div>
  `;
}

function setupSidebarEvents(): void {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      setSetting('sidebarCollapsed', isCollapsed);
    });
  }

  const navItems = document.querySelectorAll('.sidebar-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const path = item.getAttribute('data-path');
      if (path) {
        navigate(path);
      }
      
      // on mobile, close sidebar after clicking
      if (window.innerWidth <= 768) {
        sidebar?.classList.remove('open');
      }
    });
  });
  
  const themeToggle = document.getElementById('theme-toggle-sidebar');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = getSetting('theme');
      const next = current === 'dark' ? 'light' : 'dark';
      setSetting('theme', next);
      themeToggle.innerHTML = next === 'dark' ? icon('sun') : icon('moon');
      document.documentElement.setAttribute('data-theme', next);
    });
  }

  updateActiveItem(getCurrentPath());
}

function updateActiveItem(path: string): void {
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    if (item.getAttribute('data-path') === path) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
