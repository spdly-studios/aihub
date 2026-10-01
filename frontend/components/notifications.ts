import { icon } from '../utils/icons';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

let container: HTMLElement | null = null;

export function initNotifications(): void {
  container = document.createElement('div');
  container.className = 'notifications-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
}

export function notify(message: string, type: NotificationType = 'info', duration?: number): void {
  if (!container) initNotifications();

  const finalDuration = duration || (type === 'error' ? 6000 : 4000);
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-circle';
  if (type === 'warning') iconName = 'alert-triangle';

  toast.innerHTML = `
    <div class="toast-icon">${icon(iconName)}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close">${icon('x')}</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn?.addEventListener('click', () => {
    dismissToast(toast);
  });

  container!.appendChild(toast);

  // Manage max visible
  const toasts = container!.querySelectorAll('.toast');
  if (toasts.length > 5) {
    dismissToast(toasts[0] as HTMLElement);
  }

  // Auto-dismiss
  setTimeout(() => {
    if (document.body.contains(toast)) {
      dismissToast(toast);
    }
  }, finalDuration);
}

function dismissToast(toast: HTMLElement): void {
  toast.classList.add('hiding');
  toast.addEventListener('animationend', () => {
    toast.remove();
  });
}
