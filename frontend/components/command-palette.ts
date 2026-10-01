import { icon } from '../utils/icons';
import { navigate } from '../router';
import { getSetting, setSetting } from '../storage/settings';
import { closeModal, openModal } from './modal';

interface Command {
  id: string;
  title: string;
  description?: string;
  iconName: string;
  group: 'Actions' | 'Navigation' | 'Recent';
  shortcut?: string;
  action: () => void;
}

const commands: Command[] = [
  { id: 'new-chat', title: 'New Chat', description: 'Create a new conversation', iconName: 'message-square', group: 'Actions', action: () => navigate('/') },
  { id: 'new-workspace', title: 'New Workspace', iconName: 'layout', group: 'Actions', action: () => navigate('/workspace') },
  { id: 'new-prompt', title: 'New Prompt', iconName: 'edit-3', group: 'Actions', action: () => navigate('/prompts') },
  { id: 'add-endpoint', title: 'Add Endpoint', iconName: 'server', group: 'Navigation', action: () => navigate('/endpoints') },
  { id: 'add-provider', title: 'Add Provider', iconName: 'cloud', group: 'Navigation', action: () => navigate('/providers') },
  { id: 'open-playground', title: 'Open Playground', iconName: 'play', group: 'Navigation', action: () => navigate('/playground') },
  { id: 'search-models', title: 'Search Models', iconName: 'box', group: 'Navigation', action: () => navigate('/models') },
  { id: 'open-api', title: 'Open API Documentation', iconName: 'code', group: 'Navigation', action: () => navigate('/api') },
  { id: 'open-settings', title: 'Open Settings', iconName: 'settings', group: 'Navigation', action: () => navigate('/settings') },
  { id: 'toggle-dark', title: 'Toggle Dark Mode', iconName: 'moon', group: 'Actions', action: () => {
      const current = getSetting('theme');
      const next = current === 'dark' ? 'light' : 'dark';
      setSetting('theme', next);
      document.documentElement.setAttribute('data-theme', next);
    }
  },
  { id: 'toggle-sidebar', title: 'Toggle Sidebar', iconName: 'menu', group: 'Actions', action: () => {
      const container = document.querySelector('.sidebar-container');
      if (container) {
        container.classList.toggle('collapsed');
        setSetting('sidebarCollapsed', container.classList.contains('collapsed'));
      }
    }
  },
  { id: 'toggle-debug', title: 'Toggle Debug Mode', iconName: 'terminal', group: 'Actions', action: () => {
      const current = getSetting('debugMode');
      setSetting('debugMode', !current);
    }
  }
];

let selectedIndex = 0;
let filteredCommands = [...commands];

export function initCommandPalette(): void {
  // Keyboard shortcut is set up at the bottom of this module
}

export function openCommandPalette(): void {
  const searchIcon = icon('search');
  const contentHtml = '<div class="command-palette">' +
    '<div class="cp-search">' +
    searchIcon +
    '<input type="text" id="cp-input" placeholder="Type a command or search..." autocomplete="off">' +
    '</div>' +
    '<div class="cp-results" id="cp-results"></div>' +
    '</div>';

  const modalEl = openModal({
    title: '',
    className: 'command-palette-modal',
    content: contentHtml,
    size: 'lg'
  });

  // Remove default modal header for cleaner look
  const header = modalEl.querySelector('.modal-header');
  if (header) header.remove();

  const input = modalEl.querySelector('#cp-input') as HTMLInputElement;
  const resultsContainer = modalEl.querySelector('#cp-results') as HTMLElement;

  if (input) {
    input.focus();
    input.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value.toLowerCase();
      filteredCommands = commands.filter(c =>
        c.title.toLowerCase().includes(val) ||
        (c.description && c.description.toLowerCase().includes(val))
      );
      selectedIndex = 0;
      renderResults(resultsContainer, filteredCommands);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
        renderResults(resultsContainer, filteredCommands);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderResults(resultsContainer, filteredCommands);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          closeModal(modalEl);
        }
      }
    });
  }

  renderResults(resultsContainer, filteredCommands);
}

function renderResults(container: HTMLElement, items: Command[]) {
  if (items.length === 0) {
    container.innerHTML = '<div class="cp-empty">No results found</div>';
    return;
  }

  const groups = ['Actions', 'Navigation', 'Recent'];
  let html = '';
  let globalIndex = 0;

  groups.forEach(group => {
    const groupItems = items.filter(i => i.group === group);
    if (groupItems.length > 0) {
      html += '<div class="cp-group-title">' + group + '</div>';
      groupItems.forEach(item => {
        const isSelected = globalIndex === selectedIndex ? 'selected' : '';
        html += '<div class="cp-item ' + isSelected + '" data-index="' + globalIndex + '">' +
          '<div class="cp-item-icon">' + icon(item.iconName) + '</div>' +
          '<div class="cp-item-content">' +
          '<div class="cp-item-title">' + item.title + '</div>' +
          (item.description ? '<div class="cp-item-desc">' + item.description + '</div>' : '') +
          '</div>' +
          (item.shortcut ? '<div class="cp-item-shortcut">' + item.shortcut + '</div>' : '') +
          '</div>';
        globalIndex++;
      });
    }
  });

  container.innerHTML = html;

  container.querySelectorAll('.cp-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-index') || '0', 10);
      if (items[idx]) {
        items[idx].action();
        closeModal();
      }
    });

    if (el.classList.contains('selected')) {
      (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  });
}

// Global shortcut handler
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openCommandPalette();
  }
});
