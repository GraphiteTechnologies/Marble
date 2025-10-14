import { writable } from 'svelte/store';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const toasts = writable<Toast[]>([]);

export const sendToast = (message: string, type: ToastType = 'info') => {
  const id = Math.random().toString(36).substring(2, 9);
  toasts.update((all) => [...all, { id, message, type }]);
  setTimeout(() => {
    toasts.update((all) => all.filter((t) => t.id !== id));
  }, 3000);
};