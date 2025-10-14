import AppStore from './AppStore.svelte';
import { AppType } from './types';
import {Storefront} from "phosphor-svelte";

export const appStore = {
  id: 'app-store',
  name: 'App Store',
  type: AppType.APPLICATION,
  component: AppStore,
  icon: Storefront,
};
