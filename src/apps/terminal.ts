import type { AppManifest } from './types';
import TerminalComponent from './Terminal.svelte';
import { Terminal } from 'phosphor-svelte';

export const TerminalApp: AppManifest = {
  id: 'terminal',
  name: 'Terminal',
  icon: Terminal,
  component: TerminalComponent,
};
