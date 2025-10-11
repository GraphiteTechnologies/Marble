import type { AppManifest } from './types';
import WelcomeComponent from './Welcome.svelte';
import { HandWaving } from 'phosphor-svelte';

export const WelcomeApp: AppManifest = {
  id: 'welcome',
  name: 'Welcome',
  icon: HandWaving,
  component: WelcomeComponent,
};
