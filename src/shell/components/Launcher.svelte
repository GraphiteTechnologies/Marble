<script lang="ts">
  import type { AppManifest } from '../../apps/types';
  import { fly, fade } from 'svelte/transition';

  export let appRegistry: AppManifest[] = [];
  export let onOpenApp: (app: AppManifest) => void = () => {};
  export let onClose: () => void = () => {};
</script>

<div class="scrim" on:click={onClose} transition:fade={{ duration: 150 }}>
  <div
    class="launcher"
    on:click|stopPropagation
    transition:fly={{ duration: 250, x: -100, opacity: 0 }}
  >
    <div class="app-grid">
      {#each appRegistry as app (app.id)}
        <button class="app-tile" on:click={() => { onOpenApp(app); onClose(); }}>
          <div class="icon-wrapper">
            <svelte:component this={app.icon} size={28} />
          </div>
          <span class="app-name">{app.name}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

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
  }
  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
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
</style>
