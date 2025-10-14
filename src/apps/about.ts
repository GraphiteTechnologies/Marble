import type { AppMetadata } from './types';
import AboutComponent from './About.svelte';
import { Info } from 'phosphor-svelte';
import { AppType } from './types';

export const about: AppMetadata = {
  id: 'about',
  name: 'About',
  type: AppType.APPLICATION,
  component: AboutComponent,
  icon: Info,
};
