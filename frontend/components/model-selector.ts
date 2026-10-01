import { icon } from '../utils/icons';

export interface ModelSelectorOptions {
  containerId: string;
  onSelect: (model: ModelOption) => void;
  selectedModel?: string;
  showEndpoint?: boolean;
  showFavorites?: boolean;
}

export interface ModelOption {
  id: string;
  provider: string;
  name: string;
  favorited: boolean;
  alias?: string;
}

// Mocked fetch for models
async function fetchModels(): Promise<ModelOption[]> {
  return [
    { id: 'gpt-4-turbo', provider: 'openai', name: 'GPT-4 Turbo', favorited: true },
    { id: 'gpt-3.5-turbo', provider: 'openai', name: 'GPT-3.5 Turbo', favorited: false },
    { id: 'claude-3-opus', provider: 'anthropic', name: 'Claude 3 Opus', favorited: true },
    { id: 'claude-3-sonnet', provider: 'anthropic', name: 'Claude 3 Sonnet', favorited: false }
  ];
}

export async function createModelSelector(options: ModelSelectorOptions): Promise<void> {
  const container = document.getElementById(options.containerId);
  if (!container) return;

  let models = await fetchModels();
  
  let selected = models.find(m => m.id === options.selectedModel) || models[0];
  let isOpen = false;

  const selector = document.createElement('div');
  selector.className = 'model-selector';
  
  const trigger = document.createElement('button');
  trigger.className = 'model-selector-trigger';
  trigger.innerHTML = `
    <span class="model-provider-badge">${selected.provider}</span>
    <span class="model-name-truncate">${selected.name}</span>
    ${icon('chevron-down')}
  `;
  
  const dropdown = document.createElement('div');
  dropdown.className = 'model-dropdown hidden';
  
  function renderDropdown(filteredModels: ModelOption[]) {
    dropdown.innerHTML = `
      <div class="model-search">
        ${icon('search')}
        <input type="text" id="model-search-input" placeholder="Search models...">
      </div>
      <div class="model-list">
        ${filteredModels.map(m => `
          <div class="model-item ${m.id === selected.id ? 'active' : ''}" data-id="${m.id}">
            <div class="model-item-info">
              <span class="model-provider-badge">${m.provider}</span>
              <span class="model-item-name">${m.name}</span>
            </div>
            <button class="model-favorite-btn ${m.favorited ? 'active' : ''}">
              ${icon('star')}
            </button>
          </div>
        `).join('')}
      </div>
    `;

    const searchInput = dropdown.querySelector('#model-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value.toLowerCase();
        const filtered = models.filter(m => m.name.toLowerCase().includes(val) || m.provider.toLowerCase().includes(val));
        renderDropdown(filtered);
        // re-focus input since it was re-rendered
        setTimeout(() => {
          const newSearchInput = dropdown.querySelector('#model-search-input') as HTMLInputElement;
          if (newSearchInput) {
            newSearchInput.focus();
            newSearchInput.value = val;
          }
        }, 0);
      });
    }

    dropdown.querySelectorAll('.model-item').forEach(el => {
      el.addEventListener('click', (e) => {
        // Prevent selecting if clicking favorite button
        if ((e.target as HTMLElement).closest('.model-favorite-btn')) {
          e.stopPropagation();
          const id = el.getAttribute('data-id');
          const model = models.find(m => m.id === id);
          if (model) {
            model.favorited = !model.favorited;
            renderDropdown(models);
          }
          return;
        }

        const id = el.getAttribute('data-id');
        const model = models.find(m => m.id === id);
        if (model) {
          selected = model;
          options.onSelect(selected);
          trigger.innerHTML = `
            <span class="model-provider-badge">${selected.provider}</span>
            <span class="model-name-truncate">${selected.name}</span>
            ${icon('chevron-down')}
          `;
          isOpen = false;
          dropdown.classList.add('hidden');
        }
      });
    });
  }

  renderDropdown(models);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    if (isOpen) {
      dropdown.classList.remove('hidden');
      renderDropdown(models);
      const searchInput = dropdown.querySelector('#model-search-input') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    } else {
      dropdown.classList.add('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    if (!selector.contains(e.target as Node)) {
      isOpen = false;
      dropdown.classList.add('hidden');
    }
  });

  selector.appendChild(trigger);
  selector.appendChild(dropdown);
  container.innerHTML = '';
  container.appendChild(selector);
}
