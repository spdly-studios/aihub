import './styles/main.css';
import { initRouter } from './router';
import { initState } from './state';
import { initSidebar } from './components/sidebar';
import { initHeader } from './components/header';
import { initCommandPalette } from './components/command-palette';
import { initNotifications } from './components/notifications';
import { initTheme } from './utils/theme';
import { initKeyboard } from './utils/keyboard';
import { initStorage } from './storage/index';

async function boot() {
  // Initialize storage (IndexedDB)
  await initStorage();
  
  // Initialize state management
  initState();
  
  // Initialize theme (load from localStorage)
  initTheme();
  
  // Initialize UI components
  initSidebar();
  initHeader();
  initCommandPalette();
  initNotifications();
  
  // Initialize keyboard shortcuts
  initKeyboard();
  
  // Initialize router (handles navigation, renders pages)
  initRouter();
  
  console.log('[SPDLY AI] Initialized');
}

boot().catch(err => {
  console.error('[SPDLY AI] Boot failed:', err);
  document.getElementById('content')!.innerHTML = `
    <div class="flex-center" style="height:100vh;flex-direction:column;gap:1rem">
      <h1 class="text-xl font-semibold">Failed to initialize SPDLY AI</h1>
      <p class="text-secondary">${err.message}</p>
      <button class="btn btn-primary" onclick="location.reload()">Retry</button>
    </div>
  `;
});
