<script lang="ts">
    import {onMount, setContext} from 'svelte';
    import {writable} from 'svelte/store';
    import {fade} from 'svelte/transition';
    import type {Kernel} from '../kernel/Kernel';
    import type {WindowState} from '../kernel/services/windowManager.types';
    import {appRegistry as staticAppRegistry} from '../apps/registry';
    import {webApps} from './store/webAppsStore';
    import {dateTimeStore} from './store/dateTimeStore';
    import {accounts} from './store/accountStore';

    import Desktop from './components/Desktop.svelte';
    import Dock from './components/Dock.svelte';
    import Window from './components/Window.svelte';
    import Launcher from './components/Launcher.svelte';
    import ContextMenu from './components/ContextMenu.svelte';
    import CalendarPopup from './components/CalendarPopup.svelte';
    import Toaster from './components/Toaster.svelte';
    import Setup from './auth/Setup.svelte';
    import Login from './auth/Login.svelte';

    import './auth/auth.css';

    export let kernel: Kernel;

    setContext('kernel', kernel);

    type AuthState = 'setup' | 'login' | 'authenticated';
    let authState: AuthState;

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
        if(event.key === 'Meta' && event.shiftKey) {
            event.preventDefault();
            launcherOpen = !launcherOpen;
        }
    }

    onMount(() => {
        const unsubscribeAccounts = accounts.subscribe(users => {
            const session = accounts.getSession();
            if (users.length === 0) {
                authState = 'setup';
            } else if (session) {
                authState = 'authenticated';
            } else {
                authState = 'login';
            }
        });


        setTimeout(() => {
            dockVisible = true;
        }, 500);

        window.addEventListener('keydown', handleKeyDown);

        const unsubscribeWindows = kernel.windowManager.subscribe((newWindows) => {
            windows.set(newWindows);
        });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            unsubscribeAccounts();
            unsubscribeWindows();
        }
    });
</script>

{#if authState === 'setup'}
    <div in:fade={{duration: 300, delay: 300}} out:fade={{duration: 300}}>
        <Setup on:accountCreated={() => authState = 'authenticated'} />
    </div>
{:else if authState === 'login'}
    <div class="auth-container-wrapper" in:fade={{duration: 300, delay: 300}} out:fade={{duration: 300}}>
        <Login on:loginSuccess={() => authState = 'authenticated'} />
    </div>
{:else if authState === 'authenticated'}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions, a11y-no-noninteractive-tabindex -->
    <div role="application" tabindex="0" on:contextmenu={handleContextMenu} on:click={closeContextMenu} on:keydown={(e) => e.key === 'Escape' && closeContextMenu()}>
        <Desktop>
            {#each $windows as window (window.id)}
                <Window {window} />
            {/each}

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

            <Dock
                    appRegistry={combinedAppRegistry}
                    {windows}
                    visible={dockVisible}
                    onOpenApp={(app) => kernel.windowManager.open(app)}
                    onToggleLauncher={() => launcherOpen = !launcherOpen}
            />
        </Desktop>
        <Toaster />
    </div>
{/if}
