<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Kernel } from '../kernel/Kernel';
  import type { WindowState } from '../kernel/services/windowManager.types';
  import { appRegistry } from '../apps/registry';

  import Desktop from './components/Desktop.svelte';
  import Dock from './components/Dock.svelte';
  import Window from './components/Window.svelte';
  import Launcher from './components/Launcher.svelte';
  import ContextMenu from './components/ContextMenu.svelte';

  export let kernel: Kernel;

  setContext('kernel', kernel);

  const windows = writable<WindowState[]>([]);
  let launcherOpen = false;
  let contextMenu = { visible: false, x: 0, y: 0 };

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    contextMenu = { visible: true, x: e.clientX, y: e.clientY };
  }

  function closeContextMenu() {
    contextMenu.visible = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Meta') {
      e.preventDefault();
      launcherOpen = !launcherOpen;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);

    const unsubscribe = kernel.windowManager.subscribe((newWindows) => {
      windows.set(newWindows);
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribe();
    }
  });
</script>

<div on:contextmenu={handleContextMenu} on:click={closeContextMenu}>
  <Desktop>
    {#each $windows as window (window.id)}
      <Window {window} />
    {/each}

    {#if launcherOpen}
      <Launcher
        {appRegistry}
        onOpenApp={(app) => kernel.windowManager.open(app)}
        onClose={() => launcherOpen = false}
      />
    {/if}

    {#if contextMenu.visible}
      <ContextMenu x={contextMenu.x} y={contextMenu.y} />
    {/if}

    <Dock
      {appRegistry}
      {windows}
      onOpenApp={(app) => kernel.windowManager.open(app)}
      onToggleLauncher={() => launcherOpen = !launcherOpen}
    />
  </Desktop>
</div>
