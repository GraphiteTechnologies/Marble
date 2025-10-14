import type { AppMetadata } from './types';
import BrowserComponent from './Browser.svelte';
import { Globe } from 'phosphor-svelte';
import { AppType } from './types';

export const browser: AppMetadata = {
  id: 'browser',
  name: 'Browser',
  type: AppType.APPLICATION,
  component: BrowserComponent,
  icon: Globe,
};
