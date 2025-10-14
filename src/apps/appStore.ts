import AppStore from './AppStore.svelte';
import { AppType } from './types';
import AppStoreLogo from './AppStoreLogo.svelte';

export const appStore = {
  id: 'app-store',
  name: 'App Store',
  type: AppType.APPLICATION,
  component: AppStore,
  icon: AppStoreLogo,
};
