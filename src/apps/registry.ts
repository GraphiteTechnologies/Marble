import type { AppManifest } from './types';
import { WelcomeApp } from './welcome';
import { BrowserApp } from './browser';
import { TerminalApp } from './terminal';

export const appRegistry: AppManifest[] = [
  WelcomeApp,
  BrowserApp,
  TerminalApp,
];
