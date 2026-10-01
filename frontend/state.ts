import { debounce } from './utils/helpers';

export interface AppState {
  currentRoute: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  commandPaletteOpen: boolean;
  activeModel: string;
  activeEndpoint: string;
  activeWorkspace: string;
  activeConversation: string | null;
  debugMode: boolean;
}

type Listener = (value: any, state: AppState) => void;

let state: AppState = {
  currentRoute: '/',
  sidebarCollapsed: false,
  theme: 'dark',
  commandPaletteOpen: false,
  activeModel: '',
  activeEndpoint: '',
  activeWorkspace: 'default',
  activeConversation: null,
  debugMode: false,
};

const listeners = new Map<keyof AppState, Set<Listener>>();

const saveState = debounce(() => {
  try {
    const toSave = { ...state };
    localStorage.setItem('spdly_state', JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}, 300);

export function initState() {
  try {
    const stored = localStorage.getItem('spdly_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      state = { ...state, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

export function getState(): AppState {
  return state;
}

export function setState(partial: Partial<AppState>) {
  state = { ...state, ...partial };
  saveState();
  
  Object.keys(partial).forEach(key => {
    emit(key as keyof AppState);
  });
}

export function subscribe(key: keyof AppState, listener: Listener): () => void {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(listener);
  
  return () => {
    listeners.get(key)?.delete(listener);
  };
}

export function emit(key: keyof AppState) {
  const keyListeners = listeners.get(key);
  if (keyListeners) {
    keyListeners.forEach(fn => fn(state[key], state));
  }
}

