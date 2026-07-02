export type ToastType = 'success' | 'error' | 'info';

export interface ToastDetail {
  id: number;
  message: string;
  type: ToastType;
}

export function toast(message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return;
  const detail: ToastDetail = { id: Date.now() + Math.random(), message, type };
  window.dispatchEvent(new CustomEvent('fasty:toast', { detail }));
}
