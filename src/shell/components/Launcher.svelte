<script lang="ts">
    import type {AppMetadata} from '../../apps/types';
    import {fade, fly} from 'svelte/transition';
    import {onMount, tick} from 'svelte';
    import {pinnedApps} from '../store/pinnedAppsStore';
    import {webApps} from '../store/webAppsStore';
    import { accounts } from '../store/accountStore';
    import {Power} from 'phosphor-svelte';

    export let appRegistry: AppMetadata[] = [];
    export let onOpenApp: (app: AppMetadata) => void = () => {
    };
    export let onClose: () => void = () => {
    };

    let searchTerm = '';
    let searchInput: HTMLInputElement;
    let contextMenu: { x: number; y: number; app: AppMetadata } | null = null;
    let contextMenuEl: HTMLDivElement;
    let powerMenuVisible = false;

    $: filteredApps = appRegistry.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    onMount(() => {
        searchInput.focus();
        window.addEventListener('click', closeContextMenu);
    });

    function handleScrimClick(e: MouseEvent) {
        if(e.currentTarget === e.target) {
            onClose();
        }
    }

    async function handleContextMenu(e: MouseEvent, app: AppMetadata) {
        e.preventDefault();
        contextMenu = {x: e.clientX, y: e.clientY, app};
        await tick();
        adjustContextMenuPosition();
    }

    function adjustContextMenuPosition() {
        if(!contextMenuEl || !contextMenu)
            return;

        const {innerWidth, innerHeight} = window;
        const {offsetWidth, offsetHeight} = contextMenuEl;

        if(contextMenu.x + offsetWidth > innerWidth)
            contextMenu.x -= offsetWidth;
        if(contextMenu.y + offsetHeight > innerHeight)
            contextMenu.y -= offsetHeight;
    }

    function closeContextMenu() {
        contextMenu = null;
    }

    function isPinned(app: AppMetadata): boolean {
        let isPinned = false;
        const unsubscribe = pinnedApps.subscribe(apps => {
            isPinned = apps.includes(app.id);
        });
        unsubscribe();
        return isPinned;
    }

    function togglePin(app: AppMetadata) {
        pinnedApps.update(apps => {
            if(apps.includes(app.id)) {
                return apps.filter(id => id !== app.id);
            } else {
                return [...apps, app.id];
            }
        });
        closeContextMenu();
    }
    function uninstall(app: AppMetadata) {
        webApps.remove(app.id);
        closeContextMenu();
    }

    function logout() {
        accounts.logout();
        window.location.reload();
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
        <div class="main-content">
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
                {#each filteredApps as app (app.id)}
                    <button
                            class="app-tile"
                            on:click={() => { onOpenApp(app); onClose(); }}
                            on:contextmenu|preventDefault|stopPropagation={(e) => handleContextMenu(e, app)}
                    >
              <span class="icon-wrapper">
                {#if typeof app.icon === 'string'}
                  <img src={app.icon} alt={app.name} width="28" height="28"/>
                {:else}
                  <svelte:component this={app.icon} size={28}/>
                {/if}
              </span>
                        <span class="app-name">{app.name}</span>
                    </button>
                {/each}
            </div>
        </div>
        <div class="launcher-footer">
            <button class="power-button" on:click={() => powerMenuVisible = !powerMenuVisible}>
                <Power size={20}/>
            </button>
            {#if powerMenuVisible}
                <div class="power-menu" transition:fade={{duration: 100}}>
                    <button on:click={logout}>Logout</button>
                </div>
            {/if}
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
        {#if contextMenu.app.url}
            <div class="divider"/>
            <button on:click={() => uninstall(contextMenu.app)}>Uninstall</button>
        {/if}
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
    .divider {
        height: 1px;
        background-color: var(--border-color);
        margin: var(--spacing-small) 0;
    }

    .launcher {
        width: 100%;
        max-width: 480px;
        height: auto;
        max-height: 70vh;
        background-color: var(--ui-transparent-background);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        padding: 16px;
        margin-left: 8px;
        margin-bottom: 56px;
        display: flex;
        flex-direction: column;
    }

    .main-content {
        flex-grow: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .search-bar-wrapper {
        margin-bottom: 16px;
    }

    .search-input {
        width: 93%;
        padding: 10px 14px;
        background-color: var(--ui-transparent-background);
        border: none !important;
        border-radius: 12px;
        color: var(--primary-text);
        font-size: 15px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
        box-shadow: none;
    }

    .app-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        padding-right: 8px;
        flex-grow: 1;
    }

    .app-tile {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 12px;
        transition: background-color 0.2s;
    }

    .app-tile:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .icon-wrapper {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .app-name {
        font-size: 12px;
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

    .launcher-footer {
        padding-top: 16px;
        display: flex;
        justify-content: flex-end;
        position: relative;
    }

    .power-button {
        background: none;
        border: none;
        color: var(--primary-text);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .power-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .power-menu {
        position: absolute;
        bottom: 52px;
        right: 0;
        background-color: var(--ui-transparent-background);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: var(--spacing-small);
        z-index: 1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .power-menu button {
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

    .power-menu button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>
