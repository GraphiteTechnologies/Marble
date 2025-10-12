<script lang="ts">
  import type { AppMetadata } from '../../apps/types';
  import { fly, fade } from 'svelte/transition';
  import { onMount, tick } from 'svelte';
  import { pinnedApps } from '../store/pinnedAppsStore';

  export let appRegistry: AppMetadata[] = [];
  export let onOpenApp: (app: AppMetadata) => void = () => {};
  export let onClose: () => void = () => {};

  let searchTerm = '';
  let searchInput: HTMLInputElement;
  let contextMenu: { x: number; y: number; app: AppMetadata } | null = null;
  let contextMenuEl: HTMLDivElement;

  $: filteredApps = appRegistry.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  onMount(() => {
    searchInput.focus();
    window.addEventListener('click', closeContextMenu);
  });

  function handleScrimClick(e: MouseEvent) {
    if (e.currentTarget === e.target) {
      onClose();
    }
  }

  async function handleContextMenu(e: MouseEvent, app: AppMetadata) {
    e.preventDefault();
    contextMenu = { x: e.clientX, y: e.clientY, app };
    await tick(); // Wait for the DOM to update
    adjustContextMenuPosition();
  }

  function adjustContextMenuPosition() {
    if (!contextMenuEl) return;
    const { innerWidth, innerHeight } = window;
    const { offsetWidth, offsetHeight } = contextMenuEl;
    if (contextMenu.x + offsetWidth > innerWidth) {
      contextMenu.x -= offsetWidth;
    }
    if (contextMenu.y + offsetHeight > innerHeight) {
      contextMenu.y -= offsetHeight;
    }
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  function isPinned(app: AppMetadata): boolean {
    let isPinned = false;
    const unsubscribe = pinnedApps.subscribe(apps => {
      isPinned = apps.includes(app.name);
    });
    unsubscribe();
    return isPinned;
  }

  function togglePin(app: AppMetadata) {
    pinnedApps.update(apps => {
      if (apps.includes(app.name)) {
        return apps.filter(name => name !== app.name);
      } else {
        return [...apps, app.name];
      }
    });
    closeContextMenu();
  }
</script>

<div
  role="button"
  tabindex="0"
  class="scrim"
  on:click={handleScrimClick}
  on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}
  transition:fade={{ duration: 150 }}
>
  <div
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    class="launcher"
    on:keydown={(e) => e.key === 'Escape' && onClose()}
    transition:fly={{ duration: 250, x: -100, opacity: 0 }}
  >
    <div class="search-bar-wrapper">
      <input
        bind:this={searchInput}
        type="text"
        bind:value={searchTerm}
        placeholder="Search for apps..."
        class="search-input"
      />
    </div>
    <div class="app-grid">
      {#each filteredApps as app (app.name)}
        <button
          class="app-tile"
          on:click={() => { onOpenApp(app); onClose(); }}
          on:contextmenu|preventDefault|stopPropagation={(e) => handleContextMenu(e, app)}
        >
          <span class="icon-wrapper">
            <svelte:component this={app.icon} size={28} />
          </span>
          <span class="app-name">{app.name}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

{#if contextMenu}
  <div
    bind:this={contextMenuEl}
    class="context-menu"
    style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
    transition:fade={{ duration: 100 }}
  >
    <button on:click={() => togglePin(contextMenu.app)}>
      {isPinned(contextMenu.app) ? 'Unpin from Dock' : 'Pin to Dock'}
    </button>
  </div>
{/if}

<style>
  .scrim {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 11000;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
  }
  .launcher {
    width: 100%;
    max-width: 500px;
    height: auto;
    max-height: 70vh;
    background-color: rgba(32, 33, 36, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 20px;
    margin-left: 8px;
    margin-bottom: 56px;
    display: flex;
    flex-direction: column;
  }
  .search-bar-wrapper {
    margin-bottom: 20px;
  }
  .search-input {
    width: 100%;
    padding: 12px 16px;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: var(--primary-text);
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-hover);
  }
  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
    overflow-y: auto;
    padding-right: 8px;
  }
  .app-tile {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 12px;
    transition: background-color 0.2s;
  }
  .app-tile:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .app-name {
    font-size: 13px;
  }
  .context-menu {
    position: absolute;
    background-color: var(--secondary-background);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-small);
    z-index: 12000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
  .context-menu button {
    background: none;
    border: none;
    color: var(--primary-text);
    cursor: pointer;
    padding: var(--spacing-small) var(--spacing-medium);
    width: 100%;
    text-align: left;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  .context-menu button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
</style>
