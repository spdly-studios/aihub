import { icon } from '../utils/icons';
import { getState, setState, subscribe } from '../state';
import { navigate, getRoutes, getCurrentPath } from '../router';
import { getSetting, setSetting } from '../storage/settings';

export function initSidebar(): void {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = buildSidebar();
  setupSidebarEvents();
  
  // Subscribe to route changes to update active state
  subscribe('currentRoute', updateActiveItem);
}

function buildSidebar(): string {
  const isCollapsed = getSetting('sidebarCollapsed');
  const theme = getSetting('theme');
  const collapsedClass = isCollapsed ? 'collapsed' : '';
  
  return `
    <div class="sidebar-container ${collapsedClass}">
      <div class="sidebar-header">
        <div class="logo">SPDLY AI</div>
        <button id="sidebar-toggle" class="icon-btn" title="Toggle Sidebar">
          ${icon('menu')}
        </button>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="section-title">MAIN</div>
          <a href="/" class="nav-item" data-path="/">
            ${icon('message-square')} <span class="label">Chat</span>
          </a>
          <a href="/workspace" class="nav-item" data-path="/workspace">
            ${icon('layout')} <span class="label">Workspace</span>
          </a>
        </div>
        <div class="nav-section">
          <div class="section-title">BUILD</div>
          <a href="/playground" class="nav-item" data-path="/playground">
            ${icon('play')} <span class="label">Playground</span>
          </a>
          <a href="/endpoints" class="nav-item" data-path="/endpoints">
            ${icon('server')} <span class="label">Endpoints</span>
          </a>
          <a href="/models" class="nav-item" data-path="/models">
            ${icon('box')} <span class="label">Models</span>
          </a>
          <a href="/providers" class="nav-item" data-path="/providers">
            ${icon('cloud')} <span class="label">Providers</span>
          </a>
        </div>
        <div class="nav-section">
          <div class="section-title">MANAGE</div>
          <a href="/requests" class="nav-item" data-path="/requests">
            ${icon('activity')} <span class="label">Requests</span>
          </a>
          <a href="/files" class="nav-item" data-path="/files">
            ${icon('folder')} <span class="label">Files</span>
          </a>
          <a href="/prompts" class="nav-item" data-path="/prompts">
            ${icon('edit-3')} <span class="label">Prompts</span>
          </a>
          <a href="/agents" class="nav-item" data-path="/agents">
            ${icon('users')} <span class="label">Agents</span>
          </a>
          <a href="/tools" class="nav-item" data-path="/tools">
            ${icon('tool')} <span class="label">Tools</span>
          </a>
        </div>
        <div class="nav-section">
          <div class="section-title">SYSTEM</div>
          <a href="/api" class="nav-item" data-path="/api">
            ${icon('code')} <span class="label">API</span>
          </a>
          <a href="/usage" class="nav-item" data-path="/usage">
            ${icon('pie-chart')} <span class="label">Usage</span>
          </a>
          <a href="/settings" class="nav-item" data-path="/settings">
            ${icon('settings')} <span class="label">Settings</span>
          </a>
        </div>
      </nav>
      <div class="sidebar-footer">
        <button id="theme-toggle-sidebar" class="icon-btn" title="Toggle Theme">
          ${theme === 'dark' ? icon('sun') : icon('moon')}
        </button>
        <div class="user-status">
          ${icon('user')} <span class="label">User</span>
        </div>
      </div>
    </div>
  `;
}

function setupSidebarEvents(): void {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const container = document.querySelector('.sidebar-container');
  
  if (toggleBtn && container) {
    toggleBtn.addEventListener('click', () => {
      container.classList.toggle('collapsed');
      const isCollapsed = container.classList.contains('collapsed');
      setSetting('sidebarCollapsed', isCollapsed);
    });
  }

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const path = item.getAttribute('data-path');
      if (path) {
        navigate(path);
      }
      
      // on mobile, close sidebar after clicking
      if (window.innerWidth <= 768) {
        container?.classList.remove('mobile-open');
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
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-path') === path) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
