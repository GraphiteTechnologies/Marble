import Settings from './Settings.svelte';
import type { AppMetadata } from './types';
import { AppType } from './types';
import SettingsIcon from './SettingsIcon.svelte';

export const settings: AppMetadata = {
  name: 'Settings',
  type: AppType.APPLICATION,
  component: Settings,
  icon: SettingsIcon,
  metadata: {
    width: 400,
    height: 300,
  },
};
