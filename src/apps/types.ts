import type { SvelteComponent } from 'svelte';

export interface AppManifest {
  id: string;
  name: string;
  icon: typeof SvelteComponent;
  component: typeof SvelteComponent;
}
