import type { AppMetadata } from './types';
import { welcome } from './welcome';
import { browser } from './browser';
import { terminal } from './terminal';
import { settings } from './settings';
import { about } from './about';
import { appStore } from './appStore';

export const appRegistry: AppMetadata[] = [
  welcome,
  browser,
  terminal,
  settings,
  about,
  appStore,
];
