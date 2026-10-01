import { getState, setState } from '../state';
import { navigate } from '../router';

export function initKeyboard() {
  window.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const current = getState().commandPaletteOpen;
      setState({ commandPaletteOpen: !current });
    }
    
    // Ctrl/Cmd + /
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const current = getState().sidebarCollapsed;
      setState({ sidebarCollapsed: !current });
    }

    // Escape
    if (e.key === 'Escape') {
      setState({ commandPaletteOpen: false });
      // add other modal close logic here
    }

    // Ctrl/Cmd + N
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      navigate('/');
      // Trigger new chat logic if already on chat page
      window.dispatchEvent(new CustomEvent('newchat'));
    }
  });
}
