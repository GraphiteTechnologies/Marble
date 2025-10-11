<script lang="ts">
  import type { AppManifest } from '../../apps/types';
  import type { Writable } from 'svelte/store';
  import type { WindowState } from '../../kernel/services/windowManager.types';
  import { DotsNine } from 'phosphor-svelte';
  import Clock from './Clock.svelte';

  export let appRegistry: AppManifest[] = [];
  export let windows: Writable<WindowState[]>;
  export let onOpenApp: (app: AppManifest) => void = () => {};
  export let onToggleLauncher: () => void = () => {};
</script>

<div class="shelf">
  <div class="left-controls">
    <button class="launcher-button" on:click={onToggleLauncher} />
  </div>

  <div class="app-icons-container">
    {#each appRegistry as app (app.id)}
      <button class="app-button" on:click={() => onOpenApp(app)}>
        <div class="icon-wrapper">
          <svelte:component this={app.icon} size={24} />
        </div>
        {#if $windows.some(win => win.appId === app.id)}
          <div class="running-indicator" />
        {/if}
      </button>
    {/each}
  </div>

  <div class="right-controls">
    <Clock />
  </div>
</div>

<style>
  .shelf {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 48px;
    background-color: rgba(32, 33, 36, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    z-index: 10000;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
  }

  .left-controls, .right-controls {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .right-controls {
    justify-content: flex-end;
  }

  .launcher-button {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: transparent;
    border: 1.5px solid #e8eaed;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .launcher-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .app-icons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    height: 100%;
  }

  .app-button {
    position: relative;
    background: none;
    border: none;
    padding: 0;
    border-radius: 8px;
    cursor: pointer;
    color: white;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .app-button:hover .icon-wrapper {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  .running-indicator {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background-color: #8ab4f8;
    border-radius: 50%;
  }
</style>
