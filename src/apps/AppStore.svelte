<script lang="ts">
  import { onMount } from 'svelte';
  import { webApps } from '../shell/store/webAppsStore';
  import type { AppMetadata } from './types';
  import PhosphorIcon from '../shell/components/PhosphorIcon.svelte';

  interface AppStoreApp {
    name: string;
    author: string;
    url: string;
    icon?: string;
  }

  let apps: AppStoreApp[] = [];
  let installedApps: AppMetadata[] = [];

  webApps.subscribe(value => {
    installedApps = value;
  });

  onMount(async () => {
    const response = await fetch('/apps.json');
    apps = await response.json();
  });

  function install(app: AppStoreApp) {
    webApps.addWebApp(app.url);
  }

  function isInstalled(app: AppStoreApp) {
    return installedApps.some(installedApp => installedApp.url === app.url);
  }
</script>

<div class="app-store">
  <h1>App Store</h1>
  <div class="app-grid">
    {#each apps as app}
      <div class="app-card">
        <div class="app-icon">
          {#if app.icon}
            <PhosphorIcon name={app.icon} size={32} />
          {:else}
            <img src={`https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}&sz=128`} alt={app.name} />
          {/if}
        </div>
        <div class="app-info">
          <h2>{app.name}</h2>
          <p>{app.author}</p>
        </div>
        <button on:click={() => install(app)} disabled={isInstalled(app)}>
          {isInstalled(app) ? 'Installed' : 'Install'}
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .app-store {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .app-card {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .app-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app-icon img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .app-info h2 {
    margin: 0;
    font-size: 16px;
  }

  .app-info p {
    margin: 4px 0 12px;
    font-size: 14px;
    color: #aaa;
  }

  button {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: var(--accent-color-hover);
  }

  button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
</style>
