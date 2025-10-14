import type { AppMetadata } from './types';
import TerminalComponent from './Terminal.svelte';
import { Terminal } from 'phosphor-svelte';
import { AppType } from './types';

export const terminal: AppMetadata = {
  id: 'terminal',
  name: 'Terminal',
  type: AppType.APPLICATION,
  component: TerminalComponent,
  icon: Terminal,
};
