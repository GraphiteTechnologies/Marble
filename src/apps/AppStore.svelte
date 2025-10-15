<script lang="ts">
  import { onMount } from 'svelte';
  import { webApps } from '../shell/store/webAppsStore';
  import { sendToast } from '../shell/store/toasterStore';
  import type { AppMetadata } from './types';
  import PhosphorIcon from '../shell/components/PhosphorIcon.svelte';
  import Loader from '../shell/components/Loader.svelte';
  import '../shell/AppKit.css';
  import { MagnifyingGlass } from "phosphor-svelte";

  interface AppStoreApp {
    name: string;
    author: string;
    url: string;
    icon?: string;
    category: string;
  }

  let allApps: AppStoreApp[] = [];
  let installedApps: AppMetadata[] = [];
  let searchTerm = '';
  let isLoading = true;
  let categories: string[] = [];
  let selectedCategory: string | null = null;

  webApps.subscribe(value => {
    installedApps = value;
  });

  onMount(async () => {
    isLoading = true;
    const response = await fetch('/apps.json');
    allApps = await response.json();
    categories = ['All', ...new Set(allApps.map(app => app.category))];
    selectedCategory = categories[0];

    await preloadImages(allApps);
    isLoading = false;
  });

  function preloadImages(apps: AppStoreApp[]) {
    const promises = apps.map(app => {
      return new Promise((resolve, _reject) => {
        if (app.icon) {
          resolve(true);
          return;
        }
        const img = new Image();
        img.src = `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}&sz=128`;
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    return Promise.all(promises);
  }

  function install(app: AppStoreApp) {
    webApps.addWebApp(app.url);
    sendToast(`Installed ${app.name}`);
  }

  function isInstalled(app: AppStoreApp) {
    return installedApps.some(installedApp => installedApp.url === app.url);
  }

  $: filteredApps = allApps.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  $: categorizedApps = filteredApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, AppStoreApp[]>);
</script>

<div class="app-store-layout">
  <div class="sidebar">
    <h2>Categories</h2>
    <ul>
      {#each categories as category}
        <li class:active={category === selectedCategory} on:click={() => selectedCategory = category}>
          {category}
        </li>
      {/each}
    </ul>
  </div>

  <div class="main-content">
    <div class="header">
      <h1>App Store</h1>
      <div class="search-box">
        <MagnifyingGlass />
        <input type="text" placeholder="Search apps..." bind:value={searchTerm} />
      </div>
    </div>

    {#if isLoading}
      <div class="loader-container">
        <Loader />
      </div>
    {:else}
      <div class="content-area">
        {#each Object.entries(categorizedApps) as [category, apps]}
          <div class="category-group">
            {#if selectedCategory === 'All'}
              <h2>{category}</h2>
            {/if}
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
                    <h3>{app.name}</h3>
                    <p>{app.author}</p>
                  </div>
                  <button class="btn" on:click={() => install(app)} disabled={isInstalled(app)}>
                    {isInstalled(app) ? 'Installed' : 'Install'}
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .app-store-layout {
    display: flex;
    height: 100%;
    background-color: var(--background);
  }

  .sidebar {
    width: 200px;
    padding: var(--spacing-large);
    border-right: 1px solid var(--border-color);
    background-color: var(--secondary-background);
  }

  .sidebar h2 {
    margin-top: 0;
    margin-bottom: var(--spacing-large);
    font-size: 18px;
  }

  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sidebar li {
    padding: var(--spacing-medium);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .sidebar li:hover {
    background-color: var(--tertiary-background);
  }

  .sidebar li.active {
    background-color: var(--primary-accent);
    color: white;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-large);
    border-bottom: 1px solid var(--border-color);
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background-color: var(--secondary-background);
    border-radius: var(--border-radius);
    padding: var(--spacing-small) var(--spacing-medium);
  }

  .search-box input {
    border: none;
    background: none;
    outline: none;
    color: var(--primary-text);
    margin-left: var(--spacing-small);
  }

  .loader-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-large);
  }

  .category-group {
    margin-bottom: var(--spacing-xlarge);
  }

  .category-group h2 {
    margin-bottom: var(--spacing-medium);
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-large);
  }

  .app-card {
    background-color: var(--secondary-background);
    border-radius: var(--border-radius);
    padding: var(--spacing-medium);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid var(--border-color);
  }

  .app-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .app-icon {
    width: 64px;
    height: 64px;
    margin-bottom: var(--spacing-medium);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app-icon img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }

  .app-info h3 {
    margin: 0;
    font-size: 14px;
  }

  .app-info p {
    margin: 4px 0 12px;
    font-size: 12px;
    color: var(--secondary-text);
  }

  .btn {
    width: 100%;
  }
  
  .btn:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
</style>