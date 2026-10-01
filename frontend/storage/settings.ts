export interface Settings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  debugMode: boolean;
  
  defaultModel: string;
  defaultEndpoint: string;
  fallbackModel: string;
  temperature: number;
  maxTokens: number;
  streamingEnabled: boolean;
  
  modelAliases: Record<string, string>;
  
  failoverEnabled: boolean;
  failoverChain: string[];
  
  loadBalancingStrategy: 'fixed' | 'round-robin' | 'random' | 'lowest-latency';
  
  saveRequestBodies: boolean;
  
  capiKey: string;
}

const DEFAULTS: Settings = {
  theme: 'system',
  sidebarCollapsed: false,
  debugMode: false,
  defaultModel: 'gpt-4o',
  defaultEndpoint: 'openai',
  fallbackModel: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 4096,
  streamingEnabled: true,
  modelAliases: {},
  failoverEnabled: false,
  failoverChain: [],
  loadBalancingStrategy: 'fixed',
  saveRequestBodies: false,
  capiKey: ''
};

const SETTINGS_KEY = 'spdly_settings';

export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
  const settings = getAllSettings();
  return settings[key] !== undefined ? settings[key] : DEFAULTS[key];
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  const settings = getAllSettings();
  settings[key] = value;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getAllSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULTS;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch (e) {
    return DEFAULTS;
  }
}

export function resetSettings(): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULTS));
}

export function exportSettings(): string {
  const settings = getAllSettings();
  const exportable = { ...settings, capiKey: '' };
  return JSON.stringify(exportable, null, 2);
}

export function importSettings(json: string): void {
  try {
    const imported = JSON.parse(json);
    const current = getAllSettings();
    const merged = { ...current, ...imported };
    // Preserve sensitive keys if empty in import
    if (!imported.capiKey && current.capiKey) {
      merged.capiKey = current.capiKey;
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to import settings', e);
  }
}
