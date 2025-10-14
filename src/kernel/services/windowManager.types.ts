import type { Component } from 'svelte';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  component: Component;
  icon: Component | string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isFocused: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  props?: Record<string, any>;
}
