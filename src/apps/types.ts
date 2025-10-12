import type {Component, SvelteComponent} from 'svelte';
import type { IconComponentProps } from "phosphor-svelte";

type ComponentType = typeof SvelteComponent | Component<IconComponentProps, {}, "">

export interface AppManifest {
  id: string;
  name: string;
  icon: ComponentType;
  component: typeof ComponentType;
}
