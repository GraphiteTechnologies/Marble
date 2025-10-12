import type { Component } from 'svelte';

export enum AppType {
  APPLICATION = 'APPLICATION',
  SYSTEM = 'SYSTEM',
}

export interface AppMetadata {
  name: string;
  type: AppType;
  component: Component;
  icon: Component;
  metadata?: {
    width?: number;
    height?: number;
  };
}
