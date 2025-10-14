import type { AppMetadata } from './types';
import WelcomeComponent from './Welcome.svelte';
import { HandWaving } from 'phosphor-svelte';
import { AppType } from './types';

export const welcome: AppMetadata = {
  id: 'welcome',
  name: 'Welcome',
  type: AppType.APPLICATION,
  component: WelcomeComponent,
  icon: HandWaving,
};
