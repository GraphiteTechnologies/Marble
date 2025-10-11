import type { AppManifest } from './types';
import BrowserComponent from './Browser.svelte';
import { Globe } from 'phosphor-svelte';

export const BrowserApp: AppManifest = {
  id: 'browser',
  name: 'Browser',
  icon: Globe,
  component: BrowserComponent,
};
