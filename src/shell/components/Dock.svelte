<script lang="ts">
    import type {AppMetadata} from '../../apps/types';
    import type {Writable} from 'svelte/store';
    import type {WindowState} from '../../kernel/services/windowManager.types';
    import {getContext} from 'svelte';
    import type {Kernel} from '../../kernel/Kernel';
    import {fly} from 'svelte/transition';
    import {pinnedApps} from '../store/pinnedAppsStore';
    import DateTime from './DateTime.svelte';

    export let windows: Writable<WindowState[]>;
    export let appRegistry: AppMetadata[] = [];
    export let onOpenApp: (app: AppMetadata) => void = () => {
    };
    export let onToggleLauncher: () => void = () => {
    };
    export let visible = false;

    const kernel = getContext<Kernel>('kernel');
    let draggedApp: AppMetadata | null = null;
    let dropIndex: number | null = null;

    $: pinnedAppMetadata = $pinnedApps
        .map(id => appRegistry.find(app => app.id === id))
        .filter((app): app is AppMetadata => !!app);

    function onAppClick(app: AppMetadata) {
        const window = $windows.find(win => win.appId === app.id);
        if(window) {
            if(window.isMinimized) {
                kernel.windowManager.restore(window.id);
            } else {
                kernel.windowManager.focus(window.id);
            }
        } else {
            onOpenApp(app);
        }
    }

    function handleDragStart(app: AppMetadata) {
        draggedApp = app;
    }

    function handleDragOver(event: DragEvent, index: number) {
        event.preventDefault();
        dropIndex = index;
    }

    function handleDrop() {
        if(draggedApp && dropIndex !== null) {
            const currentApps = $pinnedApps;
            const draggedIndex = currentApps.indexOf(draggedApp.id);

            const newPinnedApps = [...currentApps];
            newPinnedApps.splice(draggedIndex, 1);
            newPinnedApps.splice(dropIndex, 0, draggedApp.id);

            pinnedApps.set(newPinnedApps);
        }
        draggedApp = null;
        dropIndex = null;
    }
</script>

{#if visible}
    <div class="shelf" transition:fly={{ y: 48, duration: 500 }}>
        <div class="left-controls">
            <button class="launcher-button" on:click={onToggleLauncher} aria-label="Open launcher"></button>
        </div>

                <div class="app-icons-container" role="list" on:dragover={(e) => e.preventDefault()} on:drop={handleDrop}>
                    {#each pinnedAppMetadata as app, i (app.id)}
                        <div
                            role="listitem"
                            class="app-button-wrapper"
                            class:drag-over={i === dropIndex}
                            on:dragover={(e) => handleDragOver(e, i)}
                        >                    <button
                            class="app-button"
                            draggable="true"
                            on:dragstart={() => handleDragStart(app)}
                            on:click={() => onAppClick(app)}
                    >
                        <span class="icon-wrapper">
                            {#if typeof app.icon === 'string'}
                                <img src={app.icon} alt={app.name} width="24" height="24"/>
                            {:else}
                                <svelte:component this={app.icon} size={24}/>
                            {/if}
                        </span>
                        {#if $windows.some(win => win.appId === app.id)}
                            <span class="running-indicator"></span>
                        {/if}
                    </button>
                </div>
            {/each}
        </div>

        <div class="right-controls">
            <DateTime/>
        </div>
    </div>
{/if}

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
        border: 2px solid #e8eaed;
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

    .app-button-wrapper {
        position: relative;
        transition: transform 0.2s;
    }

    .app-button-wrapper.drag-over::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 24px;
        background-color: var(--accent-color);
        border-radius: 1px;
    }
</style>
