<script lang="ts">
    import {onMount, setContext} from 'svelte';
    import {writable} from 'svelte/store';
    import type {Kernel} from '../kernel/Kernel';
    import type {WindowState} from '../kernel/services/windowManager.types';
    import {appRegistry as staticAppRegistry} from '../apps/registry';
    import {webApps} from './store/webAppsStore';
    import {dateTimeStore} from './store/dateTimeStore';

    import Desktop from './components/Desktop.svelte';
    import Dock from './components/Dock.svelte';
    import Window from './components/Window.svelte';
    import Launcher from './components/Launcher.svelte';
    import ContextMenu from './components/ContextMenu.svelte';
    import CalendarPopup from './components/CalendarPopup.svelte';
    import ClockDetailsPopup from './components/ClockDetailsPopup.svelte';

    export let kernel: Kernel;

    setContext('kernel', kernel);

    const windows = writable<WindowState[]>([]);
    let launcherOpen = false;
    let contextMenu = {visible: false, x: 0, y: 0};
    let dockVisible = false;

    $: combinedAppRegistry = [...staticAppRegistry, ...$webApps];

    function handleContextMenu(event: MouseEvent) {
        event.preventDefault();
        contextMenu = {visible: true, x: event.clientX, y: event.clientY};
    }

    function closeContextMenu() {
        contextMenu.visible = false;
    }

    function handleKeyDown(event: KeyboardEvent) {
        if(event.key === 'Meta') {
            event.preventDefault();
            launcherOpen = !launcherOpen;
        }
    }

    onMount(() => {
        setTimeout(() => {
            dockVisible = true;
        }, 500);

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
      
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions, a11y-no-noninteractive-tabindex -->
      <div role="application" tabindex="0" on:contextmenu={handleContextMenu} on:click={closeContextMenu} on:keydown={(e) => e.key === 'Escape' && closeContextMenu()}>
        <Desktop>
          {#each $windows as window (window.id)}
            <Window {window} />        {/each}

        {#if launcherOpen}
            <Launcher
                    appRegistry={combinedAppRegistry}
                    onOpenApp={(app) => kernel.windowManager.open(app)}
                    onClose={() => launcherOpen = false}
            />
        {/if}

        {#if contextMenu.visible}
            <ContextMenu x={contextMenu.x} y={contextMenu.y}/>
        {/if}

        {#if $dateTimeStore.calendarVisible}
            <CalendarPopup />
        {/if}

        {#if $dateTimeStore.clockDetailsVisible}
            <ClockDetailsPopup />
        {/if}

        <Dock
                appRegistry={combinedAppRegistry}
                {windows}
                visible={dockVisible}
                onOpenApp={(app) => kernel.windowManager.open(app)}
                onToggleLauncher={() => launcherOpen = !launcherOpen}
        />
    </Desktop>
</div>
