import { getState, setState } from '../state';

export function getTheme(): 'light' | 'dark' {
  return getState().theme;
}

export function setTheme(theme: 'light' | 'dark') {
  setState({ theme });
  document.documentElement.setAttribute('data-theme', theme);
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0D0D0D' : '#ffffff');
  }
}

export function toggleTheme() {
  const current = getTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  const current = getTheme();
  // Ensure DOM is in sync with state
  setTheme(current);
}
