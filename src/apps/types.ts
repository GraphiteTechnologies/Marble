import type { Component } from 'svelte';

export interface AppManifest {
  id: string;
  name: string;
  icon: Component;
  component: Component;
}
