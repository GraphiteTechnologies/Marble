import type { Component } from 'svelte';

export enum AppType {
  APPLICATION = 'APPLICATION',
  SYSTEM = 'SYSTEM',
}

export interface AppMetadata {
  id?: string;
  name: string;
  type: AppType;
  component: Component;
  icon: string | Component;
  url?: string;
  metadata?: {
    width?: number;
    height?: number;
  };
}
