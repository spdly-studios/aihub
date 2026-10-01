import { icon } from '../utils/icons';

export interface ModalOptions {
  title: string;
  content: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
  footer?: string;
  className?: string;
}

const modals: HTMLElement[] = [];

export function openModal(options: ModalOptions): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = `modal modal-${options.size || 'md'} ${options.className || ''}`;
  
  let headerHtml = '';
  if (options.title) {
    headerHtml = `
      <div class="modal-header">
        <h3 class="modal-title">${options.title}</h3>
        ${options.closable !== false ? `<button class="modal-close">${icon('x')}</button>` : ''}
      </div>
    `;
  }
  
  const footerHtml = options.footer ? `<div class="modal-footer">${options.footer}</div>` : '';
  
  modal.innerHTML = `
    ${headerHtml}
    <div class="modal-body">${options.content}</div>
    ${footerHtml}
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Body scroll lock
  document.body.style.overflow = 'hidden';
  
  if (options.closable !== false) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
        if (options.onClose) options.onClose();
      }
    });
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal(overlay);
        if (options.onClose) options.onClose();
      });
    }
  }

  modals.push(overlay);
  
  return modal;
}

export function closeModal(modalEl?: HTMLElement): void {
  if (modalEl) {
    modalEl.remove();
    const index = modals.indexOf(modalEl);
    if (index > -1) modals.splice(index, 1);
  } else if (modals.length > 0) {
    const el = modals.pop();
    if (el) el.remove();
  }
  
  if (modals.length === 0) {
    document.body.style.overflow = '';
  }
}

export function closeAllModals(): void {
  while(modals.length > 0) {
    closeModal();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modals.length > 0) {
    closeModal();
  }
});
